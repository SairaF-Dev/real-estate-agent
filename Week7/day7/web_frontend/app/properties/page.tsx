"use client";

import { useEffect, useState, useCallback } from "react";
import { api, ApiError } from "@/lib/api";
import { mlApi, type Week8Property } from "@/lib/mlApi";
import { useSession } from "@/components/SessionProvider";
import { PropertyCard, getPropertyPhoto, formatPakistaniPrice } from "@/components/PropertyCard";
import { PropertyDetailModal } from "@/components/PropertyDetailModal";
import { Empty, ErrorNotice, Loading } from "@/components/States";
import type { Property, SearchFilters } from "@/types/api";

const VERIFIED_PROPERTY_TYPES = [
  { value: "House", label: "House" },
  { value: "Flat", label: "Flat / Apartment" },
  { value: "Upper Portion", label: "Upper Portion" },
  { value: "Lower Portion", label: "Lower Portion" },
  { value: "Farm House", label: "Farm House" },
  { value: "Penthouse", label: "Penthouse" },
  { value: "Room", label: "Room" },
];

function toProperty(w8: Week8Property): Property {
  return {
    property_id: w8.property_id,
    property_name: w8.property_name,
    city: w8.city,
    area: w8.location,
    price: w8.price,
    currency: "PKR",
    bedrooms: w8.bedrooms ?? null,
    bathrooms: w8.bathrooms ?? w8.baths ?? null,
    property_type: w8.property_type,
    purpose: w8.purpose,
    amenities: [
      w8.area,
      w8.agency ? `Agency: ${w8.agency}` : "Listing agency not provided",
      w8.province_name,
    ].filter(Boolean),
    available: w8.available ?? true,
    status: w8.status || "Available",
  };
}

export default function Properties() {
  const { customer } = useSession();
  const [rows, setRows] = useState<Property[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [totalCount, setTotalCount] = useState<number | null>(null);

  // Filter State
  const [city, setCity] = useState("");
  const [area, setArea] = useState("");
  const [budgetMax, setBudgetMax] = useState("");
  const [bedrooms, setBedrooms] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [purpose, setPurpose] = useState("");

  const search = useCallback(
    async (filters: {
      city?: string;
      area?: string;
      budgetMax?: number;
      bedrooms?: number;
      propertyType?: string;
      purpose?: string;
    }) => {
      setBusy(true);
      setError("");

      try {
        let loaded = false;
        try {
          // Query Week 8 verified dataset
          const res = await mlApi.getProperties({
            city: filters.city || undefined,
            location: filters.area || undefined,
            max_price: filters.budgetMax,
            bedrooms: filters.bedrooms,
            property_type: filters.propertyType || undefined,
            purpose: filters.purpose || undefined,
            limit: 24,
          });

          if (res?.properties) {
            setRows(res.properties.map(toProperty));
            setTotalCount(res.total);
            loaded = true;
          }
        } catch {
          // Fallback to standard property search
        }

        if (!loaded) {
          const body: SearchFilters = { customer_id: customer?.customer_id, limit: 24 };
          if (filters.city) body.city = filters.city;
          if (filters.area) body.area = filters.area;
          if (filters.budgetMax) body.budget_max = filters.budgetMax;
          if (filters.bedrooms) body.bedrooms = filters.bedrooms;
          if (filters.propertyType) body.property_type = filters.propertyType;
          if (filters.purpose) body.purpose = filters.purpose;

          const fallback = await api.searchProperties(body);
          setRows(fallback);
          setTotalCount(fallback.length);
        }
      } catch (e) {
        setError(e instanceof ApiError ? e.message : "Could not search properties.");
      } finally {
        setBusy(false);
      }
    },
    [customer?.customer_id]
  );

  const [modalProperty, setModalProperty] = useState<Property | null>(null);

  useEffect(() => {
    void search({});
  }, [search]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const urlParams = new URLSearchParams(window.location.search);
    const propId = urlParams.get("id");
    if (!propId) return;

    mlApi.getProperty(propId)
      .then((p) => {
        if (p) setModalProperty(toProperty(p));
      })
      .catch(() => {});
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void search({
      city: city.trim() || undefined,
      area: area.trim() || undefined,
      budgetMax: budgetMax ? Number(budgetMax) : undefined,
      bedrooms: bedrooms ? Number(bedrooms) : undefined,
      propertyType: propertyType || undefined,
      purpose: purpose || undefined,
    });
  };

  return (
    <>
      <div className="page-title">
        <span className="eyebrow">PROPERTY LISTINGS</span>
        <h1>Explore Properties</h1>
        <p>
          Browse property listings from across Pakistan and explore indicative price insights.
        </p>
      </div>

      <form className="search-bar" onSubmit={handleSubmit}>
        <input
          name="city"
          placeholder="City (e.g. Lahore, Karachi, Islamabad)"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />
        <input
          name="area"
          placeholder="Locality or Area (e.g. Gulberg, DHA)"
          value={area}
          onChange={(e) => setArea(e.target.value)}
        />
        <input
          name="budget_max"
          type="number"
          min="0"
          placeholder="Maximum budget (PKR)"
          value={budgetMax}
          onChange={(e) => setBudgetMax(e.target.value)}
        />
        <input
          name="bedrooms"
          type="number"
          min="0"
          placeholder="Beds"
          value={bedrooms}
          onChange={(e) => setBedrooms(e.target.value)}
        />
        <select
          name="property_type"
          value={propertyType}
          onChange={(e) => setPropertyType(e.target.value)}
        >
          <option value="">Any property type</option>
          {VERIFIED_PROPERTY_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
        <select
          name="purpose"
          value={purpose}
          onChange={(e) => setPurpose(e.target.value)}
        >
          <option value="">Any purpose</option>
          <option value="For Sale">For Sale / Purchase</option>
          <option value="For Rent">For Rent</option>
        </select>
        <button type="submit" className="primary" disabled={busy}>
          {busy ? "Searching…" : "Search"}
        </button>
      </form>

      {totalCount !== null && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", color: "var(--color-muted)", fontSize: "0.875rem" }}>
          <span>
            Showing <strong>{rows?.length || 0}</strong> property listings
            {totalCount > (rows?.length || 0) && ` of ${totalCount.toLocaleString()} total`}
          </span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#10b981" }} />
          Property listings
          </span>
        </div>
      )}

      {busy && <Loading label="Searching property listings…" />}
      {error && <ErrorNotice message={error} />}
      {rows?.length === 0 && !busy && (
        <Empty title="No matching listings found" text="Try a broader city, area, budget or property type." />
      )}

      <div className="property-grid">
        {rows?.map((x) => (
          <PropertyCard key={x.property_id} property={x} />
        ))}
      </div>

      {modalProperty && (
        <PropertyDetailModal
          property={modalProperty}
          photoUrl={getPropertyPhoto(modalProperty.property_type, modalProperty.property_id)}
          priceFormatted={formatPakistaniPrice(modalProperty.price)}
          onClose={() => setModalProperty(null)}
        />
      )}
    </>
  );
}
