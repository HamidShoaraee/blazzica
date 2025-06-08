import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createService } from '../../utils/api';
import './CreateService.css';

// These categories and services would normally be fetched from an API
// For now we're hardcoding based on data.csv
const SERVICE_CATEGORIES = [
  "Hair Colour Services & Highlight",
  "Hair Treatment",
  "Haircuts, crops, hair removal, blow",
  "Hair extensions and braids",
  "Nail services",
  "Eyelash & Eyebrow services",
  "Facial services",
  "Aesthetic treatments and Tattoo services",
  "Makeup and Chignon Services",
  "Massage services",
  "Pet Grooming Services"
];

// Service data from data.csv
const SERVICES_DATA = {
  "Hair Colour Services & Highlight": [
    { name: "Root Touch-Up", minPrice: 80, maxPrice: 150 },
    { name: "Full Hair Color", minPrice: 100, maxPrice: 200 },
    { name: "Balayage", minPrice: 150, maxPrice: 300 },
    { name: "Ombre", minPrice: 140, maxPrice: 280 },
    { name: "Partial Highlights", minPrice: 120, maxPrice: 200 },
    { name: "Full Highlights", minPrice: 145, maxPrice: 280 }
  ],
  "Hair Treatment": [
    { name: "Deep Conditioning", minPrice: 50, maxPrice: 100 },
    { name: "Keratin Treatment", minPrice: 150, maxPrice: 250 },
    { name: "Scalp Treatment", minPrice: 60, maxPrice: 120 },
    { name: "Olaplex Treatment", minPrice: 70, maxPrice: 130 },
    { name: "Protein Therapy", minPrice: 60, maxPrice: 100 }
  ],
  "Haircuts, crops, hair removal, blow": [
    { name: "Women's Haircut", minPrice: 50, maxPrice: 90 },
    { name: "Men's Haircut", minPrice: 40, maxPrice: 70 },
    { name: "Kid's Haircut", minPrice: 30, maxPrice: 50 },
    { name: "Blowout", minPrice: 40, maxPrice: 80 },
    { name: "Facial Waxing/Threading", minPrice: 20, maxPrice: 50 }
  ],
  "Hair extensions and braids": [
    { name: "Clip-in Extensions", minPrice: 100, maxPrice: 200 },
    { name: "Tape-in Extensions", minPrice: 150, maxPrice: 300 },
    { name: "Sew-in Extensions", minPrice: 200, maxPrice: 400 },
    { name: "Box Braids", minPrice: 150, maxPrice: 300 },
    { name: "Cornrows", minPrice: 100, maxPrice: 200 },
    { name: "Dreadlocks", minPrice: 200, maxPrice: 500 }
  ],
  "Nail services": [
    { name: "Classic Manicure", minPrice: 30, maxPrice: 60 },
    { name: "Classic Pedicure", minPrice: 40, maxPrice: 70 },
    { name: "Gel Manicure", minPrice: 50, maxPrice: 80 },
    { name: "Acrylic Nails", minPrice: 60, maxPrice: 100 },
    { name: "Shellac Nails", minPrice: 50, maxPrice: 90 },
    { name: "Nail Art", minPrice: 20, maxPrice: 50 },
    { name: "Nail Extensions", minPrice: 70, maxPrice: 120 }
  ],
  "Eyelash & Eyebrow services": [
    { name: "Eyebrow Tinting", minPrice: 25, maxPrice: 50 },
    { name: "Eyelash Tinting", minPrice: 30, maxPrice: 60 },
    { name: "Lash Lift", minPrice: 60, maxPrice: 100 },
    { name: "Lash Extensions", minPrice: 100, maxPrice: 180 },
    { name: "Eyebrow Threading", minPrice: 20, maxPrice: 40 },
    { name: "Brow Lamination", minPrice: 50, maxPrice: 90 },
    { name: "Microblading", minPrice: 200, maxPrice: 400 }
  ],
  "Facial services": [
    { name: "Classic Facial", minPrice: 60, maxPrice: 120 },
    { name: "Anti-Aging Facial", minPrice: 80, maxPrice: 150 },
    { name: "Hydrafacial", minPrice: 120, maxPrice: 200 },
    { name: "Chemical Peel", minPrice: 100, maxPrice: 180 },
    { name: "Acne Treatment Facial", minPrice: 80, maxPrice: 150 }
  ],
  "Aesthetic treatments and Tattoo services": [
    { name: "Botox (per area)", minPrice: 100, maxPrice: 200 },
    { name: "Fillers (per syringe)", minPrice: 300, maxPrice: 600 },
    { name: "Microneedling", minPrice: 150, maxPrice: 300 },
    { name: "Semi-permanent Makeup", minPrice: 300, maxPrice: 600 },
    { name: "Tattoo (small)", minPrice: 100, maxPrice: 300 },
    { name: "Tattoo (large)", minPrice: 300, maxPrice: 800 }
  ],
  "Makeup and Chignon Services": [
    { name: "Event Makeup", minPrice: 80, maxPrice: 150 },
    { name: "Bridal Makeup", minPrice: 150, maxPrice: 300 },
    { name: "Casual Makeup", minPrice: 70, maxPrice: 120 },
    { name: "Chignon Styling", minPrice: 100, maxPrice: 200 },
    { name: "Hair Updos", minPrice: 90, maxPrice: 180 }
  ],
  "Massage services": [
    { name: "Swedish Massage", minPrice: 80, maxPrice: 140 },
    { name: "Deep Tissue Massage", minPrice: 100, maxPrice: 160 },
    { name: "Prenatal Massage", minPrice: 90, maxPrice: 150 },
    { name: "Hot Stone Massage", minPrice: 100, maxPrice: 160 },
    { name: "Reflexology", minPrice: 60, maxPrice: 100 }
  ],
  "Pet Grooming Services": [
    { name: "Basic Bath & Brush", minPrice: 40, maxPrice: 70 },
    { name: "Haircut & Style", minPrice: 60, maxPrice: 120 },
    { name: "Nail Trimming", minPrice: 20, maxPrice: 40 },
    { name: "De-shedding Treatment", minPrice: 50, maxPrice: 100 },
    { name: "Flea/Tick Treatment", minPrice: 60, maxPrice: 120 },
    { name: "Ear Cleaning", minPrice: 20, maxPrice: 40 },
    { name: "Full Grooming Package", minPrice: 100, maxPrice: 200 }
  ]
};

function CreateService({ user }) {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedService, setSelectedService] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Form data
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    is_active: true
  });

  // Update available services when category changes
  useEffect(() => {
    if (selectedCategory) {
      setServices(SERVICES_DATA[selectedCategory] || []);
    } else {
      setServices([]);
    }
    setSelectedService(null);
  }, [selectedCategory]);

  // Update form data when service selection changes
  useEffect(() => {
    if (selectedService) {
      const service = selectedService;
      setFormData(prevData => ({
        ...prevData,
        title: service.name,
        description: `Professional ${service.name} service`,
        price: Math.round((service.minPrice + service.maxPrice) / 2), // Default to middle of range
        category: selectedCategory
      }));
    }
  }, [selectedService, selectedCategory]);

  const handleCategoryChange = (e) => {
    const category = e.target.value;
    setSelectedCategory(category);
  };

  const handleServiceChange = (e) => {
    const serviceName = e.target.value;
    
    if (!serviceName) {
      setSelectedService(null);
      return;
    }
    
    const service = services.find(s => s.name === serviceName);
    
    if (service) {
      setSelectedService(service);
      // Immediately update form data with selected service details
      setFormData({
        title: service.name,
        description: `Professional ${service.name} service`,
        price: Math.round((service.minPrice + service.maxPrice) / 2), // Default to middle of range
        category: selectedCategory,
        is_active: true
      });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'price' ? parseFloat(value) : value
    });
  };

  const handlePriceChange = (e) => {
    const { value } = e.target;
    const price = parseFloat(value);
    
    if (selectedService && price < selectedService.minPrice) {
      setError(`Price must be at least $${selectedService.minPrice}`);
    } else if (selectedService && price > selectedService.maxPrice) {
      setError(`Price must be at most $${selectedService.maxPrice}`);
    } else {
      setError('');
    }
    
    setFormData({
      ...formData,
      price: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Clear previous errors
    setError('');
    
    // Basic validation
    if (!selectedService) {
      setError('Please select a service');
      return;
    }
    
    const price = parseFloat(formData.price);
    if (isNaN(price) || price <= 0) {
      setError('Please enter a valid price');
      return;
    }
    
    if (price < selectedService.minPrice) {
      setError(`Price must be at least $${selectedService.minPrice}`);
      return;
    }
    
    if (price > selectedService.maxPrice) {
      setError(`Price must be at most $${selectedService.maxPrice}`);
      return;
    }
    
    if (!formData.title || formData.title.trim() === '') {
      setError('Please enter a service title');
      return;
    }
    
    if (!formData.description || formData.description.trim() === '') {
      setError('Please enter a service description');
      return;
    }
    
    try {
      setLoading(true);
      
      // Make sure the user role is properly set for backend validation
      if (!user || !user.id) {
        setError('User session not found. Please log in again.');
        setLoading(false);
        return;
      }
      
      // Normalize role for API request
      const normalizedRole = user.role ? user.role.toLowerCase() : '';
      
      // Only providers or admins can create services
      if (normalizedRole !== 'provider' && normalizedRole !== 'admin') {
        setError(`Only providers can create services. Your current role is: ${normalizedRole}`);
        setLoading(false);
        return;
      }

      // Make the API call with explicit headers
      try {
        // Check if we have a valid token
        const token = localStorage.getItem('token');
        if (!token) {
          setError('No authentication token found. Please log in again.');
          setLoading(false);
          return;
        }

        // Prepare service data
        const serviceData = {
          title: formData.title.trim(),
          description: formData.description.trim(),
          price: parseFloat(formData.price),
          category: formData.category,
          provider_id: user.id
        };
        
        // Make API call to create service
        const result = await createService(serviceData);
        
        setSuccess('Service created successfully!');
        
        // Redirect after a short delay
        setTimeout(() => {
          navigate('/provider/services');
        }, 1500);
      } catch (err) {
        if (err.response && err.response.data && err.response.data.detail) {
          setError(`Server error: ${err.response.data.detail}`);
        } else if (err.response && err.response.status === 401) {
          setError('Authentication error. Please log in again.');
        } else if (err.response && err.response.status === 403) {
          setError('You do not have permission to create services.');
        } else {
          setError('Failed to create service. Please try again.');
        }
      }
    } catch (err) {
      if (err.response && err.response.data && err.response.data.detail) {
        setError(`Server error: ${err.response.data.detail}`);
      } else if (err.response && err.response.status === 401) {
        setError('Authentication error. Please log in again.');
      } else if (err.response && err.response.status === 403) {
        setError('You do not have permission to create services.');
      } else {
        setError('Failed to create service. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-service-container">
      <div className="create-service-card">
        <header className="create-service-header">
          <h1>Add a New Service</h1>
          <p>Select from our catalog of services and set your own price</p>
        </header>
        
        {error && (
          <div className="alert alert-error">
            <div className="alert-icon">⚠️</div>
            <p>{error}</p>
          </div>
        )}
        
        {success && (
          <div className="alert alert-success">
            <div className="alert-icon">✅</div>
            <p>{success}</p>
          </div>
        )}
        
        <form className="create-service-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="category">Service Category</label>
            <select
              id="category"
              value={selectedCategory}
              onChange={handleCategoryChange}
              required
              className="select-input"
            >
              <option value="">Select a category</option>
              {SERVICE_CATEGORIES.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
          
          {selectedCategory && (
            <div className="form-group">
              <label>Select a Service</label>
              <div className="service-options-container">
                {services.length > 0 ? (
                  services.map(service => (
                    <div 
                      key={service.name}
                      className={`service-option-card ${selectedService?.name === service.name ? 'selected' : ''}`}
                      onClick={() => handleServiceChange({ target: { value: service.name } })}
                    >
                      <div className="service-option-name">{service.name}</div>
                      <div className="service-option-price">${service.minPrice} - ${service.maxPrice}</div>
                    </div>
                  ))
                ) : (
                  <div className="no-services-message">No services available in this category</div>
                )}
              </div>
              {!selectedService && services.length > 0 && (
                <small className="form-hint">Click on a service to select it</small>
              )}
            </div>
          )}
          
          {selectedService && (
            <>
              <div className="form-group">
                <label htmlFor="title">Service Title</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className="text-input"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="4"
                  required
                  className="text-area"
                  placeholder="Describe your service, experience, and what clients can expect"
                ></textarea>
              </div>
              
              <div className="form-group">
                <label htmlFor="price">
                  Your Price (${selectedService.minPrice} - ${selectedService.maxPrice})
                </label>
                <div className="price-input-wrapper">
                  <span className="currency-symbol">$</span>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    value={formData.price}
                    onChange={handlePriceChange}
                    step="0.01"
                    min={selectedService.minPrice}
                    max={selectedService.maxPrice}
                    required
                    className="price-input"
                  />
                </div>
                <div className="price-slider-container">
                  <input
                    type="range"
                    min={selectedService.minPrice}
                    max={selectedService.maxPrice}
                    value={formData.price}
                    onChange={handlePriceChange}
                    className="price-slider"
                  />
                  <div className="price-range-labels">
                    <span>${selectedService.minPrice}</span>
                    <span>${selectedService.maxPrice}</span>
                  </div>
                </div>
              </div>
            </>
          )}
          
          <div className="form-actions">
            <button 
              type="button" 
              onClick={() => navigate('/provider/services')}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Service'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateService; 