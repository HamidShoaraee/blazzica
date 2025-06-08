import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import '../styles/ServiceDetail.css';
import { getProvidersByService, getServiceByTitle } from '../utils/api';

function ServiceDetail() {
  const { serviceName } = useParams();
  const [service, setService] = useState(null);
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState(null);
  const [filteredProviders, setFilteredProviders] = useState([]);
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [sortOption, setSortOption] = useState('recommended');
  const [error, setError] = useState(null);

  // Decode the service name from the URL
  const decodedServiceName = decodeURIComponent(serviceName);

  useEffect(() => {
    const fetchServiceDetails = async () => {
      try {
        setLoading(true);
        console.log('Fetching details for service:', decodedServiceName);
        
        // Fetch actual service data from the database
        const serviceData = await getServiceByTitle(decodedServiceName);
        
        // Format the service data
        const formattedService = {
          id: serviceData.id,
          name: serviceData.title,
          category: serviceData.category,
          description: serviceData.description,
          minPrice: serviceData.minPrice || serviceData.price,
          maxPrice: serviceData.maxPrice || serviceData.price
        };
        
        setService(formattedService);
        console.log('Service data loaded:', formattedService);
        
        // Then fetch real providers that offer this service from the database
        console.log('Fetching providers for service:', decodedServiceName, 'category:', serviceData.category);
        const providersData = await getProvidersByService(decodedServiceName, serviceData.category);
        
        console.log('Providers data received:', providersData);
        
        // Transform the provider data to match our UI requirements
        const formattedProviders = providersData.map(provider => {
          // Find the matching service (case insensitive)
          const matchingService = provider.services.find(s => 
            s.title.toLowerCase() === decodedServiceName.toLowerCase()
          );
          
          console.log(`Processing provider ${provider.id} availability:`, provider.availability);
          
          // Format availability data properly
          let formattedAvailability = [];
          if (provider.availability) {
            // Convert availability object to the expected array format
            formattedAvailability = Object.entries(provider.availability || {}).map(([day, slots]) => {
              console.log(`Day ${day} slots:`, slots);
              
              // Handle slots that might be objects with start/end times
              const formattedSlots = (slots || []).map(slot => {
                console.log('Processing slot:', slot, typeof slot);
                
                // Check if slot is an object with start/end properties
                if (slot && typeof slot === 'object' && 'start' in slot && 'end' in slot) {
                  return `${slot.start} - ${slot.end}`;
                }
                // If it's already a string, return as is
                return String(slot);
              });
              
              return {
                day,
                slots: formattedSlots
              };
            });
          }
          
          console.log('Formatted availability:', formattedAvailability);
          
          return {
            id: provider.id,
            name: provider.full_name || 'Provider',
            profileImage: provider.profile_image || "https://randomuser.me/api/portraits/lego/1.jpg", // placeholder if no image
            rating: provider.ratings_average || 4.0,
            reviews: provider.ratings_count || 0,
            price: matchingService?.price || 0,
            experience: provider.years_of_experience || 0,
            location: provider.location || 'Not specified',
            availability: formattedAvailability,
            bio: provider.bio || 'No bio available'
          };
        });
        
        console.log('Formatted providers:', formattedProviders);
        
        setProviders(formattedProviders);
        setFilteredProviders(formattedProviders);
        setPriceRange([0, formattedService.maxPrice || 1000]);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching service details:', error);
        setError(`Failed to load data for "${decodedServiceName}". Please try again later.`);
        setLoading(false);
      }
    };

    fetchServiceDetails();
  }, [decodedServiceName]);

  // Filter and sort providers
  useEffect(() => {
    let filtered = [...providers];
    
    // Filter by price range
    filtered = filtered.filter(provider => 
      provider.price >= priceRange[0] && provider.price <= priceRange[1]
    );
    
    // Filter by availability day if selected
    if (selectedDay) {
      filtered = filtered.filter(provider => 
        provider.availability.some(avail => avail.day === selectedDay)
      );
    }
    
    // Sort providers
    switch(sortOption) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      default: // 'recommended'
        filtered.sort((a, b) => b.rating * b.reviews - a.rating * a.reviews);
    }
    
    setFilteredProviders(filtered);
  }, [providers, selectedDay, priceRange, sortOption]);

  // Handle price filter change
  const handlePriceChange = (e) => {
    const value = parseInt(e.target.value);
    setPriceRange([0, value]);
  };

  if (loading) {
    return <div className="loading-container">Loading service details...</div>;
  }

  if (error) {
    return <div className="error-container">{error}</div>;
  }

  if (!service) {
    return <div className="error-container">Service not found.</div>;
  }

  return (
    <div className="service-detail-container">
      <div className="service-header">
        <div className="service-info">
          <h1>{service.name}</h1>
          <div className="service-meta">
            <span className="service-category">{service.category}</span>
            <span className="price-range">${service.minPrice} - ${service.maxPrice}</span>
          </div>
        </div>
      </div>
      
      <div className="service-content">
        <div className="service-description">
          <h2>About this service</h2>
          <p>{service.description}</p>
        </div>
        
        <div className="providers-section">
          <div className="providers-header">
            <h2>Available Service Providers</h2>
            <p>Choose a provider based on your preferences and book your appointment</p>
          </div>
          
          <div className="providers-filter-container">
            <div className="filter-group">
              <label>Filter by day:</label>
              <select 
                value={selectedDay || ''} 
                onChange={(e) => setSelectedDay(e.target.value || null)}
              >
                <option value="">Any day</option>
                <option value="Monday">Monday</option>
                <option value="Tuesday">Tuesday</option>
                <option value="Wednesday">Wednesday</option>
                <option value="Thursday">Thursday</option>
                <option value="Friday">Friday</option>
                <option value="Saturday">Saturday</option>
                <option value="Sunday">Sunday</option>
              </select>
            </div>
            
            <div className="filter-group">
              <label>Max price: ${priceRange[1]}</label>
              <input 
                type="range" 
                min={service?.minPrice || 0} 
                max={service?.maxPrice || 1000} 
                value={priceRange[1]} 
                onChange={handlePriceChange} 
              />
            </div>
            
            <div className="filter-group">
              <label>Sort by:</label>
              <select 
                value={sortOption} 
                onChange={(e) => setSortOption(e.target.value)}
              >
                <option value="recommended">Recommended</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>
          </div>
          
          <div className="providers-list">
            {filteredProviders.length > 0 ? (
              filteredProviders.map(provider => (
                <div key={provider.id} className="provider-card">
                  <div className="provider-header">
                    <img 
                      src={provider.profileImage} 
                      alt={provider.name} 
                      className="provider-image" 
                    />
                    <div className="provider-info">
                      <h3>{provider.name}</h3>
                      <div className="provider-meta">
                        <span className="provider-rating">
                          ⭐ {provider.rating} ({provider.reviews} reviews)
                        </span>
                        <span className="provider-location">
                          📍 {provider.location}
                        </span>
                      </div>
                      <div className="provider-price">
                        ${provider.price} • {provider.experience} years experience
                      </div>
                    </div>
                  </div>
                  
                  <div className="provider-bio">
                    {provider.bio}
                  </div>
                  
                  <div className="provider-availability">
                    <h4>Availability</h4>
                    {provider.availability && provider.availability.length > 0 ? (
                      <div className="availability-slots">
                        {provider.availability.map((avail, index) => (
                          <div key={index} className="day-slots">
                            <div className="day-label">{avail.day}:</div>
                            <div className="time-slots">
                              {(avail.slots || []).map((slot, idx) => (
                                <span key={idx} className="time-slot">{slot}</span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="no-availability">
                        No availability information provided. Please contact the provider.
                      </div>
                    )}
                  </div>
                  
                  <Link 
                    to={`/booking/${service.name}/${provider.id}`} 
                    className="book-button"
                  >
                    Book Appointment
                  </Link>
                </div>
              ))
            ) : (
              <div className="no-providers">
                No providers available with the current filters. Please adjust your criteria.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ServiceDetail; 