import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import {
  ArrowLeft, ArrowUpRight, BedDouble, CheckCircle2, ChevronRight, Clock3,
  Droplet, Image as ImageIcon, MapPin, MessageSquare, ShieldCheck, Users,
  Wifi, Wind, Zap, Car, Utensils, Tv,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { API_ENDPOINTS } from '../config/api';
import Swal from 'sweetalert2';
import LoadingSpinner from '../components/LoadingSpinner';
import ImageLightbox from '../components/ImageLightbox';

const GHANA_HOSTEL_IMAGE = 'https://getrooms.co/wp-content/uploads/2022/10/Bani-hostel-5709.jpg';
const ROOM_IMAGE = 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1000&q=82';

const HostelDetail = () => {
  const { id } = useParams();
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const pageRef = useRef(null);
  const [hostel, setHostel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [motionEnabled, setMotionEnabled] = useState(false);
  const [appData, setAppData] = useState({ roomType: '', semester: 'First Semester', studentName: '', contactNumber: '' });
  const [applicationStats, setApplicationStats] = useState({});
  const [lightbox, setLightbox] = useState({ open: false, images: [], currentIndex: 0 });

  useEffect(() => {
    const fetchHostel = async () => {
      try {
        const [hostelRes, statsRes] = await Promise.all([
          axios.get(API_ENDPOINTS.HOSTEL_DETAIL(id)),
          axios.get(API_ENDPOINTS.APPLICATION_STATS_BY_HOSTEL(id)).catch(() => ({ data: {} })),
        ]);
        setHostel(hostelRes.data);
        setApplicationStats(statsRes.data || {});
        if (location.state?.selectedRoom) setAppData((current) => ({ ...current, roomType: location.state.selectedRoom.type }));
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchHostel();
  }, [id, location.state]);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const targets = pageRef.current?.querySelectorAll('[data-hostel-motion]');
    if (!targets?.length) return undefined;
    setMotionEnabled(true);
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => entry.target.classList.toggle('hostel-detail-visible', entry.intersectionRatio >= 0.14)),
      { threshold: [0, 0.14, 0.5] },
    );
    targets.forEach((target) => observer.observe(target));
    return () => observer.disconnect();
  }, [loading]);

  const getFacilityIcon = (facility) => {
    const icons = {
      wifi: <Wifi aria-hidden="true" />, 'wi-fi': <Wifi aria-hidden="true" />,
      water: <Droplet aria-hidden="true" />, electricity: <Zap aria-hidden="true" />,
      security: <ShieldCheck aria-hidden="true" />, parking: <Car aria-hidden="true" />,
      ac: <Wind aria-hidden="true" />, 'air conditioning': <Wind aria-hidden="true" />,
      kitchen: <Utensils aria-hidden="true" />, tv: <Tv aria-hidden="true" />, television: <Tv aria-hidden="true" />,
    };
    return icons[facility.toLowerCase()] || <CheckCircle2 aria-hidden="true" />;
  };

  const getRoomImages = (room) => room.roomImages?.length ? room.roomImages : [room.roomImage || ROOM_IMAGE];
  const getOccupancy = (room) => room.totalCapacity ? Math.round(((room.occupiedCapacity || 0) / room.totalCapacity) * 100) : 0;
  const getApplications = (roomType) => applicationStats[roomType] || 0;
  const getLastBooking = (roomType) => {
    const date = applicationStats[`${roomType}_lastBooking`];
    if (!date) return null;
    const days = Math.floor((Date.now() - new Date(date)) / 86400000);
    return days === 0 ? 'Booked today' : days === 1 ? 'Booked yesterday' : days < 7 ? `Booked ${days} days ago` : null;
  };

  const allImages = useMemo(() => {
    if (!hostel) return [];
    const hero = hostel.hostelViewImage || hostel.hostelImages?.[0] || GHANA_HOSTEL_IMAGE;
    return Array.from(new Set([hero, ...(hostel.hostelImages || [])]));
  }, [hostel]);
  const availableRooms = hostel?.roomTypes?.filter((room) => room.available && (room.occupiedCapacity || 0) < room.totalCapacity).length || 0;
  const commissionPercent = Number(applicationStats.commissionPercent) || 3;
  const selectedRoom = hostel?.roomTypes?.find((room) => room.type === appData.roomType);

  const openLightbox = (images, currentIndex = 0) => setLightbox({ open: true, images, currentIndex });
  const selectRoom = (room) => {
    if (!room.available) return;
    if (!user) return navigate('/student-login', { state: { from: `/hostels/${id}`, selectedRoom: room } });
    if (user.role !== 'student') return;
    setAppData((current) => ({ ...current, roomType: room.type }));
    window.setTimeout(() => document.getElementById('application-panel')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 30);
  };
  const handleApply = async (event) => {
    event.preventDefault();
    if (!user) return navigate('/login');
    try {
      await axios.post(API_ENDPOINTS.APPLICATIONS, { hostelId: id, ...appData }, { headers: { Authorization: `Bearer ${token}` } });
      await Swal.fire({ title: 'Application submitted', text: 'Wait for manager approval before payment.', icon: 'success', confirmButtonColor: '#173b35', confirmButtonText: 'Go to dashboard' });
      navigate('/student-dashboard');
    } catch (error) {
      console.error(error);
      Swal.fire({ title: 'Application failed', text: error.response?.data?.message || 'Application submission failed', icon: 'error', confirmButtonColor: '#173b35' });
    }
  };

  if (loading) return <LoadingSpinner message="Opening hostel details..." fullScreen />;
  if (!hostel) return <div className="detail-not-found">Hostel not found.</div>;
  const heroImage = allImages[0] || GHANA_HOSTEL_IMAGE;

  return (
    <div ref={pageRef} className={`hostel-detail-page ${motionEnabled ? 'hostel-detail-motion' : ''}`}>
      {lightbox.open && <ImageLightbox images={lightbox.images} currentIndex={lightbox.currentIndex} onClose={() => setLightbox({ open: false, images: [], currentIndex: 0 })} onNavigate={(currentIndex) => setLightbox((current) => ({ ...current, currentIndex }))} />}
      <main>
        <section data-hostel-motion className="detail-hero">
          <div className="detail-hero-frame">
            <button type="button" onClick={() => navigate('/hostels')} className="detail-back"><ArrowLeft aria-hidden="true" /> All hostels</button>
            <button type="button" className="detail-hero-main-image" onClick={() => openLightbox(allImages)} aria-label={`Open photos of ${hostel.name}`}>
              <img src={heroImage} alt={hostel.name} onError={(event) => { event.currentTarget.src = GHANA_HOSTEL_IMAGE; }} />
              <span className="detail-image-view"><ImageIcon aria-hidden="true" /> View photos</span>
            </button>
            <div className="detail-hero-title">
              <div className="detail-verified"><ShieldCheck aria-hidden="true" /> Verified listing</div>
              <h1>{hostel.name}</h1>
              <p><MapPin aria-hidden="true" /> {hostel.location}</p>
            </div>
            <div className="detail-hero-aside" aria-label="Hostel availability">
              <span>Availability</span><strong>{availableRooms}</strong><p>{availableRooms === 1 ? 'room type open' : 'room types open'}</p>
              <button type="button" onClick={() => document.getElementById('room-options')?.scrollIntoView({ behavior: 'smooth' })}>See rooms <ChevronRight aria-hidden="true" /></button>
            </div>
          </div>
          {allImages.length > 1 && <div className="detail-image-rail" aria-label="Hostel photo gallery">
            {allImages.slice(1, 4).map((image, index) => <button type="button" key={image} onClick={() => openLightbox(allImages, index + 1)}><img src={image} alt={`${hostel.name}, view ${index + 2}`} /></button>)}
            {allImages.length > 4 && <button type="button" className="detail-more-images" onClick={() => openLightbox(allImages)}><ImageIcon aria-hidden="true" /> All {allImages.length} photos</button>}
          </div>}
        </section>

        <div className="detail-layout">
          <div className="detail-main-column">
            <section data-hostel-motion className="detail-intro"><h2>Know place before you commit.</h2><p>{hostel.description || 'Explore room options, facilities, and availability before you apply.'}</p><div className="detail-promise"><CheckCircle2 aria-hidden="true" /><span>Apply first. Pay only after manager approval.</span></div></section>
            {hostel.facilities?.length > 0 && <section data-hostel-motion className="detail-facilities"><h2>What is here</h2><div>{hostel.facilities.map((facility) => <span key={facility}>{getFacilityIcon(facility)} {facility}</span>)}</div></section>}
            {hostel.virtualTourUrl && <section data-hostel-motion className="detail-tour"><div><span>Explore first</span><h2>Take a closer look.</h2><p>Walk through this hostel before choosing a room.</p></div><iframe src={hostel.virtualTourUrl} title={`${hostel.name} virtual tour`} allowFullScreen /></section>}
            <section data-hostel-motion id="room-options" className="detail-rooms">
              <div className="detail-section-heading"><div><h2>Choose your room.</h2><p>Every option shows real approved occupancy.</p></div><span>{hostel.roomTypes?.length || 0} room types</span></div>
              <div className="detail-room-list">
                {hostel.roomTypes?.length ? hostel.roomTypes.map((room, index) => {
                  const occupancy = getOccupancy(room); const full = !room.available || occupancy >= 100; const applications = getApplications(room.type); const booking = getLastBooking(room.type); const selected = appData.roomType === room.type;
                  return <article className={`detail-room ${selected ? 'is-selected' : ''} ${full ? 'is-full' : ''}`} key={`${room.type}-${index}`}>
                    <button type="button" className="detail-room-image" onClick={() => openLightbox(getRoomImages(room))} aria-label={`Open photos of ${room.type}`}><img src={getRoomImages(room)[0]} alt={room.type} onError={(event) => { event.currentTarget.src = ROOM_IMAGE; }} />{room.roomImages?.length > 1 && <span><ImageIcon aria-hidden="true" /> {room.roomImages.length}</span>}</button>
                    <div className="detail-room-copy"><div className="detail-room-topline"><span className={full ? 'detail-status detail-status--full' : 'detail-status'}>{full ? 'Full' : occupancy >= 80 ? 'Almost full' : 'Available'}</span><span>{room.gender || 'All students'} only</span></div><h3>{room.type}</h3><div className="detail-room-facilities">{room.facilities?.slice(0, 4).map((facility) => <span key={facility}>{getFacilityIcon(facility)} {facility}</span>)}</div><div className="detail-occupancy"><div><span>Approved occupancy</span><strong>{room.occupiedCapacity || 0}/{room.totalCapacity || 0}</strong></div><i><b style={{ width: `${Math.min(occupancy, 100)}%` }} /></i></div>{(applications > 0 || booking) && <div className="detail-room-activity">{applications > 0 && <span><Users aria-hidden="true" /> {applications} applied</span>}{booking && <span><Clock3 aria-hidden="true" /> {booking}</span>}</div>}</div>
                    <div className="detail-room-action"><p><strong>GH₵{room.price}</strong><span>per semester</span></p><small>+ GH₵{Math.round(room.price * (commissionPercent / 100))} platform fee</small>{full ? <button type="button" disabled>Fully booked</button> : user && user.role !== 'student' ? null : <button type="button" onClick={() => selectRoom(room)}>{selected ? 'Selected' : user ? 'Choose room' : 'Sign in to apply'} <ArrowUpRight aria-hidden="true" /></button>}</div>
                  </article>;
                }) : <p className="detail-empty">No room types available at moment.</p>}
              </div>
            </section>
          </div>

          <aside id="application-panel" data-hostel-motion className="detail-application">
            <div className="detail-application-head"><BedDouble aria-hidden="true" /><div><span>Your application</span><h2>{selectedRoom ? selectedRoom.type : 'Start with a room'}</h2></div></div>
            {selectedRoom && user?.role === 'student' ? <form onSubmit={handleApply} className="detail-form"><p>For <strong>{hostel.name}</strong>. Manager reviews before payment.</p><label>Your full name<input type="text" required placeholder="Enter your name" value={appData.studentName} onChange={(event) => setAppData((current) => ({ ...current, studentName: event.target.value }))} /></label><label>Contact number<input type="tel" required placeholder="e.g. 024 000 0000" value={appData.contactNumber} onChange={(event) => setAppData((current) => ({ ...current, contactNumber: event.target.value }))} /></label><label>Semester<select value={appData.semester} onChange={(event) => setAppData((current) => ({ ...current, semester: event.target.value }))}><option value="First Semester">First Semester</option><option value="Second Semester">Second Semester</option></select></label><button type="submit"><MessageSquare aria-hidden="true" /> Submit application</button><button type="button" className="detail-change-room" onClick={() => setAppData((current) => ({ ...current, roomType: '' }))}>Change room</button></form> : <div className="detail-application-empty"><p>{user?.role && user.role !== 'student' ? 'Student accounts can apply for rooms.' : 'Choose available room. Your application opens here.'}</p><button type="button" onClick={() => document.getElementById('room-options')?.scrollIntoView({ behavior: 'smooth' })}>See available rooms <ChevronRight aria-hidden="true" /></button></div>}
            <div className="detail-manager"><div>{hostel.managerId?.name?.charAt(0) || 'M'}</div><p><strong>{hostel.managerId?.name || 'Hostel manager'}</strong><span><CheckCircle2 aria-hidden="true" /> Verified manager</span></p></div>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default HostelDetail;
