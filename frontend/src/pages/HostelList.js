import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Check,
  ChevronRight,
  MapPin,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { API_ENDPOINTS } from "../config/api";
import Footer from "../components/Footer";
import { HostelCardSkeleton } from "../components/SkeletonLoaders";

const GHANA_HOSTEL_IMAGE =
  "https://getrooms.co/wp-content/uploads/2022/10/Bani-hostel-5709.jpg";
const roomTypes = ["1 in a Room", "2 in a Room", "3 in a Room", "4 in a Room"];

const HostelList = () => {
  const [hostels, setHostels] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showRooms, setShowRooms] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [motionEnabled, setMotionEnabled] = useState(false);
  const pageRef = useRef(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches)
      return undefined;
    const targets = pageRef.current?.querySelectorAll("[data-catalog-motion]");
    if (!targets?.length) return undefined;
    setMotionEnabled(true);
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) =>
          entry.target.classList.toggle(
            "catalog-motion-visible",
            entry.intersectionRatio >= 0.15,
          ),
        );
      },
      { threshold: [0, 0.15, 0.55] },
    );
    targets.forEach((target) => observer.observe(target));
    return () => observer.disconnect();
  }, []);

  const getImageUrl = (imageData) => imageData || GHANA_HOSTEL_IMAGE;

  const fetchHostels = async (
    priceFilter = maxPrice,
    searchFilter = searchQuery,
  ) => {
    try {
      setLoading(true);
      setError("");
      const res = await axios.get(API_ENDPOINTS.HOSTELS);
      let filteredData = res.data;
      const query = searchFilter?.toLowerCase().trim();
      const isRoomTypeSearch =
        query &&
        roomTypes.some(
          (type) =>
            type.toLowerCase().includes(query) ||
            query.includes(type.toLowerCase().replace(" in a room", "")),
        );

      if (isRoomTypeSearch) {
        const allMatchingRooms = [];
        filteredData.forEach((hostel) =>
          hostel.roomTypes?.forEach((room) => {
            if (
              room.type.toLowerCase().includes(query) &&
              (!priceFilter ||
                priceFilter <= 0 ||
                room.price <= Number(priceFilter))
            ) {
              allMatchingRooms.push({
                ...room,
                hostelId: hostel._id,
                hostelName: hostel.name,
                hostelLocation: hostel.location,
                hostelImage: hostel.roomTypes?.[0]?.roomImage || "",
              });
            }
          }),
        );
        setRooms(allMatchingRooms);
        setHostels([]);
        setShowRooms(true);
        return;
      }

      if (query)
        filteredData = filteredData.filter((hostel) =>
          hostel.name.toLowerCase().includes(query),
        );
      if (!priceFilter || priceFilter <= 0) {
        setHostels(filteredData);
        setRooms([]);
        setShowRooms(false);
        return;
      }

      const allRooms = [];
      filteredData.forEach((hostel) =>
        hostel.roomTypes?.forEach((room) => {
          if (room.price <= Number(priceFilter)) {
            allRooms.push({
              ...room,
              hostelId: hostel._id,
              hostelName: hostel.name,
              hostelLocation: hostel.location,
              hostelImage:
                room.roomImage || hostel.roomTypes?.[0]?.roomImage || "",
            });
          }
        }),
      );
      setRooms(allRooms);
      setHostels([]);
      setShowRooms(true);
    } catch (err) {
      setError("Failed to load hostels. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHostels(
      "",
      "",
    ); /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, []);
  const handleSearch = (event) => {
    event.preventDefault();
    fetchHostels(maxPrice, searchQuery);
  };
  const chooseRoomType = (type) => {
    setSearchQuery(type);
    fetchHostels(maxPrice, type);
  };
  const clearFilter = () => {
    setMaxPrice("");
    setSearchQuery("");
    setShowRooms(false);
    fetchHostels("", "");
  };

  const getHostelStats = (hostel) => {
    const totalCapacity =
      hostel.roomTypes?.reduce((sum, room) => sum + room.totalCapacity, 0) || 0;
    const totalOccupied =
      hostel.roomTypes?.reduce(
        (sum, room) => sum + (room.occupiedCapacity || 0),
        0,
      ) || 0;
    const availableSlots = totalCapacity - totalOccupied;
    const prices = hostel.roomTypes?.map((room) => room.price) || [];
    return {
      availableSlots,
      minPrice: prices.length ? Math.min(...prices) : 0,
      maxRoomPrice: prices.length ? Math.max(...prices) : 0,
      isAvailable: availableSlots > 0,
    };
  };

  const FilterForm = ({ mobile = false }) => (
    <form
      onSubmit={(event) => {
        handleSearch(event);
        if (mobile) setShowMobileFilters(false);
      }}
      className={
        mobile ? "space-y-6" : "grid gap-3 lg:grid-cols-[1.5fr_0.75fr_auto]"
      }
    >
      <label className="catalog-field">
        <span>Hostel or room type</span>
        <div>
          <Search aria-hidden="true" />
          <input
            type="text"
            placeholder="Try ‘2 in a Room’ or a hostel name"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
          />
        </div>
      </label>
      <label className="catalog-field">
        <span>Maximum semester budget</span>
        <div>
          <b>GH₵</b>
          <input
            type="number"
            placeholder="Any budget"
            value={maxPrice}
            onChange={(event) => setMaxPrice(event.target.value)}
          />
        </div>
      </label>
      <div
        className={mobile ? "grid grid-cols-2 gap-3" : "flex items-end gap-2"}
      >
        <button type="submit" className="catalog-search-button">
          <Search aria-hidden="true" /> Search
        </button>
        <button
          type="button"
          onClick={clearFilter}
          className="catalog-clear-button"
        >
          Clear
        </button>
      </div>
    </form>
  );

  const resultCount = showRooms ? rooms.length : hostels.length;
  const resultLabel = showRooms ? "room options" : "hostels";

  return (
    <div
      ref={pageRef}
      className={`catalog-page min-h-screen bg-[#f8f6f0] text-[#173b35] ${motionEnabled ? "catalog-motion-enabled" : ""}`}
    >
      <section
        data-catalog-motion
        className="catalog-hero relative isolate overflow-hidden bg-[#173b35] px-6 pb-28 pt-16 text-white sm:px-10 sm:pb-32 sm:pt-24 lg:px-16 lg:pt-28"
      >
        <img
          src={GHANA_HOSTEL_IMAGE}
          alt="Student hostel in Ghana"
          className="catalog-hero-image absolute inset-0 h-full w-full object-cover"
        />
        <div
          aria-hidden="true"
          className="catalog-hero-overlay absolute inset-0"
        />
        <div className="relative mx-auto max-w-7xl">
          <p className="catalog-hero-kicker">Student housing across Ghana</p>
          <h1 className="max-w-4xl">Find room. Keep your footing.</h1>
          <p className="catalog-hero-copy mt-6 max-w-xl text-base leading-7 text-white/80 sm:text-lg sm:leading-8">
            Search verified accommodation by hostel, room type, or what you can
            spend. You apply first. Payment follows approval.
          </p>
          <div className="catalog-hero-proof mt-8 flex flex-wrap gap-x-5 gap-y-3 text-sm font-semibold text-[#f6deb1]">
            <span>Verified listings</span>
            <span>Apply first</span>
            <span>Pay after approval</span>
          </div>
        </div>
      </section>

      <main className="relative z-10 mx-auto -mt-16 max-w-7xl px-6 pb-20 sm:-mt-20 sm:px-10 lg:px-16">
        <section
          data-catalog-motion
          className="catalog-search-desk bg-[#f8f6f0] p-5 sm:p-7 lg:p-8"
        >
          <div className="mb-6 flex flex-col justify-between gap-2 lg:flex-row lg:items-end">
            <div>
              <h2>Start with what matters.</h2>
              <p className="mt-2 text-sm text-[#526960]">
                Search real availability. Compare details before an application.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowMobileFilters(true)}
              className="catalog-filter-trigger md:hidden"
            >
              <SlidersHorizontal aria-hidden="true" /> Open search
            </button>
          </div>
          <div className="hidden md:block">
            <FilterForm />
          </div>
          <div className="mt-6 flex flex-wrap gap-2">
            <span className="catalog-chip-label">Popular room types</span>
            {roomTypes.map((type) => (
              <button
                type="button"
                key={type}
                onClick={() => chooseRoomType(type)}
                className="catalog-chip"
              >
                {type}
              </button>
            ))}
          </div>
        </section>

        {showMobileFilters && (
          <div className="fixed inset-0 z-[60] flex items-end md:hidden">
            <button
              aria-label="Close search"
              type="button"
              className="absolute inset-0 bg-[#173b35]/60"
              onClick={() => setShowMobileFilters(false)}
            />
            <section className="catalog-mobile-sheet relative w-full rounded-t-[2rem] bg-[#f8f6f0] px-6 pb-9 pt-6">
              <div className="mb-8 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-[#c96e32]">
                    Search rooms
                  </p>
                  <h2 className="mt-1 text-2xl font-black tracking-[-0.04em]">
                    Set your search.
                  </h2>
                </div>
                <button
                  type="button"
                  aria-label="Close search"
                  onClick={() => setShowMobileFilters(false)}
                  className="catalog-close"
                >
                  <X aria-hidden="true" />
                </button>
              </div>
              <FilterForm mobile />
            </section>
          </div>
        )}

        <section data-catalog-motion className="mt-16">
          <div className="catalog-results-heading">
            <div>
              <p className="catalog-hero-kicker text-[#c96e32]">Browse</p>
              <h2 className="mt-2">
                {showRooms
                  ? "Rooms that match your search."
                  : "Hostels with room to choose."}
              </h2>
            </div>
            <div className="text-right">
              <p className="text-2xl font-black tracking-[-0.045em] text-[#173b35]">
                {resultCount}
              </p>
              <p className="text-sm text-[#526960]">
                {resultLabel}{" "}
                {showRooms && searchQuery
                  ? `for “${searchQuery}”`
                  : "available"}
              </p>
            </div>
          </div>
          {error && <div className="catalog-error mt-8">{error}</div>}
          {loading ? (
            <div className="mt-9 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <HostelCardSkeleton key={item} />
              ))}
            </div>
          ) : showRooms ? (
            <div className="catalog-results-grid mt-9">
              {rooms.map((room, index) => (
                <article
                  key={`${room.hostelId}-${room.type}-${index}`}
                  className="catalog-result group"
                >
                  <div className="catalog-result-image">
                    <img
                      src={getImageUrl(room.roomImage || room.hostelImage)}
                      alt={`${room.type} at ${room.hostelName}`}
                      onError={(event) => {
                        event.currentTarget.src = GHANA_HOSTEL_IMAGE;
                      }}
                    />
                    <span>
                      {room.gender && room.gender !== "Not Specified"
                        ? `${room.gender} only`
                        : "Room option"}
                    </span>
                  </div>
                  <div className="catalog-result-body">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="catalog-result-type">{room.type}</p>
                        <h3>{room.hostelName}</h3>
                      </div>
                      <p className="catalog-price">
                        GH₵{room.price}
                        <small>/ semester</small>
                      </p>
                    </div>
                    <p className="catalog-location">
                      <MapPin aria-hidden="true" />
                      {room.hostelLocation}
                    </p>
                    {room.facilities?.length > 0 && (
                      <p className="catalog-facilities">
                        {room.facilities.slice(0, 3).join(" · ")}
                      </p>
                    )}
                    <Link
                      to={`/hostels/${room.hostelId}`}
                      state={{ selectedRoom: room }}
                      className="catalog-result-link"
                    >
                      See room details <ArrowRight aria-hidden="true" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="catalog-results-grid mt-9">
              {hostels.map((hostel) => {
                const stats = getHostelStats(hostel);
                return (
                  <Link
                    to={`/hostels/${hostel._id}`}
                    key={hostel._id}
                    className="catalog-result group"
                  >
                    <div className="catalog-result-image">
                      <img
                        src={getImageUrl(hostel.hostelViewImage)}
                        alt={hostel.name}
                        onError={(event) => {
                          event.currentTarget.src = GHANA_HOSTEL_IMAGE;
                        }}
                      />
                      <span
                        className={
                          stats.isAvailable
                            ? "catalog-availability"
                            : "catalog-availability catalog-availability--full"
                        }
                      >
                        {stats.isAvailable
                          ? `${stats.availableSlots} slots open`
                          : "Currently full"}
                      </span>
                    </div>
                    <div className="catalog-result-body">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3>{hostel.name}</h3>
                          <p className="catalog-location">
                            <MapPin aria-hidden="true" />
                            {hostel.location}
                          </p>
                        </div>
                        {stats.minPrice > 0 && (
                          <p className="catalog-price">
                            GH₵{stats.minPrice}
                            {stats.maxRoomPrice !== stats.minPrice &&
                              `–${stats.maxRoomPrice}`}
                            <small>/ semester</small>
                          </p>
                        )}
                      </div>
                      <p className="catalog-description">
                        {hostel.description ||
                          "View available room types, facilities, and application details."}
                      </p>
                      <span className="catalog-result-link">
                        View hostel <ChevronRight aria-hidden="true" />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
          {!loading && !error && resultCount === 0 && (
            <div className="catalog-empty">
              <h3>No match yet.</h3>
              <p>
                Try another room type, raise your budget, or return to every
                available hostel.
              </p>
              <button type="button" onClick={clearFilter}>
                Show all hostels <ArrowRight aria-hidden="true" />
              </button>
            </div>
          )}
        </section>
        <aside data-catalog-motion className="catalog-assurance mt-20">
          <div>
            <p className="catalog-hero-kicker text-[#f6deb1]">
              Before you apply
            </p>
            <h2 className="mt-3">Your decision stays in your hands.</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              "Compare room details",
              "Apply for the room",
              "Pay after approval",
            ].map((item) => (
              <p key={item}>
                <Check aria-hidden="true" />
                {item}
              </p>
            ))}
          </div>
        </aside>
      </main>
      <Footer />
    </div>
  );
};

export default HostelList;
