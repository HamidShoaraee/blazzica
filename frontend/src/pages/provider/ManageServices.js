import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  getProviderServices, 
  createService, 
  updateService, 
  deleteService, 
  getServiceById
} from '../../utils/api';
import './CreateService.css'; // Use the same CSS as CreateService

// Import the service categories and data from CreateService
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

// Service data from data.csv - same as CreateService
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

// Styles for the header controls - same as other provider pages
const styles = {
  headerControls: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: '1.5rem',
    paddingTop: '0',
  },
  backButton: {
    background: '#3498db',
    color: 'white',
    border: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    transition: 'all 0.2s ease',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  backButtonIcon: {
    marginRight: '6px',
    fontSize: '16px',
  },
  fullPageContainer: {
    minHeight: '100vh',
    backgroundColor: '#f8f9fa',
    padding: '2rem',
  },
  fullWidthCard: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
    padding: '2rem',
    width: '100%',
    maxWidth: 'none',
  },
  servicesTable: {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: '1rem',
    backgroundColor: 'white',
    borderRadius: '8px',
    overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  }
};

function ManageServices({ user }) {
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  
  // Category and service selection state
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedService, setSelectedService] = useState(null);
  const [availableServices, setAvailableServices] = useState([]);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    is_active: true
  });

  useEffect(() => {
    fetchServices();
  }, [user.id]);

  // Update available services when category changes
  useEffect(() => {
    if (selectedCategory) {
      setAvailableServices(SERVICES_DATA[selectedCategory] || []);
    } else {
      setAvailableServices([]);
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
        price: Math.round((service.minPrice + service.maxPrice) / 2),
        category: selectedCategory
      }));
    }
  }, [selectedService, selectedCategory]);

  // New effect to handle direct access to edit page via URL
  useEffect(() => {
    if (serviceId) {
      fetchServiceForEdit(serviceId);
    }
  }, [serviceId]);

  const fetchServiceForEdit = async (id) => {
    try {
      setLoading(true);
      const service = await getServiceById(id);
      
      // Check if this service belongs to the current provider
      if (service && service.provider_id === user.id) {
        setEditingService(service);
        setFormData({
          title: service.title,
          description: service.description,
          price: service.price,
          category: service.category
        });
        setSelectedCategory(service.category);
        setIsFormOpen(true);
      } else {
        setError('You do not have permission to edit this service');
      }
    } catch (err) {
      setError('Failed to load service details. Please try again later.');
      console.error('Error fetching service details:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchServices = async () => {
    try {
      setLoading(true);
      const data = await getProviderServices(user.id);
      setServices(data);
    } catch (err) {
      setError('Failed to load services. Please try again later.');
      console.error('Error fetching services:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (e) => {
    const category = e.target.value;
    setSelectedCategory(category);
    setFormData(prev => ({ ...prev, category }));
  };

  const handleServiceChange = (e) => {
    const serviceName = e.target.value;
    
    if (!serviceName) {
      setSelectedService(null);
      return;
    }
    
    const service = availableServices.find(s => s.name === serviceName);
    
    if (service) {
      setSelectedService(service);
    }
  };

  const handleServiceCardClick = (service) => {
    setSelectedService(service);
    setFormData({
      title: service.name,
      description: `Professional ${service.name} service`,
      price: Math.round((service.minPrice + service.maxPrice) / 2),
      category: selectedCategory,
      is_active: true
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
    
    setFormData(prev => ({ ...prev, price: value }));
  };

  const handleToggleForm = () => {
    setIsFormOpen(!isFormOpen);
    if (!isFormOpen) {
      setEditingService(null);
      setSelectedCategory('');
      setSelectedService(null);
      setFormData({
        title: '',
        description: '',
        price: '',
        category: '',
        is_active: true
      });
    }
  };

  const handleEdit = (service) => {
    setEditingService(service);
    setSelectedCategory(service.category);
    setFormData({
      title: service.title,
      description: service.description,
      price: service.price,
      category: service.category
    });
    setIsFormOpen(true);
  };

  const handleToggleActive = async (service) => {
    try {
      await updateService(service.id, {
        is_active: !service.is_active
      });
      
      // Update local state
      setServices(services.map(s => 
        s.id === service.id ? { ...s, is_active: !s.is_active } : s
      ));
    } catch (err) {
      setError('Failed to update service status. Please try again.');
      console.error('Error updating service:', err);
    }
  };

  const handleDelete = async (serviceId) => {
    if (window.confirm('Are you sure you want to delete this service? This action cannot be undone.')) {
      try {
        await deleteService(serviceId);
        setServices(services.filter(s => s.id !== serviceId));
      } catch (err) {
        setError('Failed to delete service. Please try again.');
        console.error('Error deleting service:', err);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    try {
      setLoading(true);
      
      if (editingService) {
        // Update existing service - only allow description and price to be updated
        const serviceUpdateData = {
          description: formData.description,
          price: parseFloat(formData.price)
        };
        
        await updateService(editingService.id, serviceUpdateData);
        
        // Update local state
        setServices(services.map(s => 
          s.id === editingService.id ? { 
            ...s, 
            description: formData.description,
            price: parseFloat(formData.price)
          } : s
        ));
        
        setSuccess('Service updated successfully!');
      } else {
        // Create new service
        const serviceData = {
          title: formData.title.trim(),
          description: formData.description.trim(),
          price: parseFloat(formData.price),
          category: formData.category,
          provider_id: user.id
        };
        
        const newService = await createService(serviceData);
        setServices([...services, newService]);
        setSuccess('Service created successfully!');
      }
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        price: '',
        category: '',
        is_active: true
      });
      setSelectedCategory('');
      setSelectedService(null);
      setIsFormOpen(false);
      setEditingService(null);
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setSuccess('');
      }, 3000);
      
    } catch (err) {
      setError('Failed to save service. Please check your inputs and try again.');
      console.error('Error saving service:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && services.length === 0) {
    return <div className="loading">Loading services...</div>;
  }

  return (
    <div style={styles.fullPageContainer}>
      {!isFormOpen ? (
        <div className="manage-services-list">
          <div style={styles.headerControls}>
            <button 
              onClick={() => navigate(`/provider/dashboard/${user.id}`)}
              style={styles.backButton}
              onMouseOver={(e) => {
                e.currentTarget.style.background = '#2980b9';
                e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = '#3498db';
                e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
              }}
            >
              <span style={styles.backButtonIcon}>←</span>
              Return to Dashboard
            </button>
          </div>
          
          <div style={styles.fullWidthCard}>
            <header className="create-service-header">
              <h1>Manage Your Services</h1>
              <p>View, edit, and manage all your services</p>
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
            
            <div className="form-actions" style={{ marginBottom: '2rem', justifyContent: 'flex-end' }}>
              <button 
                onClick={handleToggleForm} 
                className="btn btn-primary"
              >
                + Add New Service
              </button>
            </div>
            
            <div className="services-list">
              {services.length === 0 ? (
                <div className="empty-state">
                  <h3>No services yet</h3>
                  <p>Start by adding your first service to attract clients</p>
                  <button onClick={handleToggleForm} className="btn btn-primary">
                    Add Your First Service
                  </button>
                </div>
              ) : (
                <div className="table-responsive">
                  <table style={styles.servicesTable}>
                    <thead>
                      <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
                        <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#495057' }}>Category</th>
                        <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#495057' }}>Title</th>
                        <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#495057' }}>Description</th>
                        <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#495057' }}>Price</th>
                        <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#495057' }}>Status</th>
                        <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#495057' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {services.map((service, index) => (
                        <tr key={service.id} style={{ 
                          borderBottom: '1px solid #dee2e6',
                          backgroundColor: index % 2 === 0 ? 'white' : '#f8f9fa'
                        }}>
                          <td style={{ padding: '1rem', color: '#495057' }}>{service.category}</td>
                          <td style={{ padding: '1rem', fontWeight: '500', color: '#212529' }}>{service.title}</td>
                          <td style={{ padding: '1rem', color: '#6c757d', maxWidth: '300px' }}>
                            <div style={{ 
                              overflow: 'hidden', 
                              textOverflow: 'ellipsis', 
                              whiteSpace: 'nowrap' 
                            }}>
                              {service.description}
                            </div>
                          </td>
                          <td style={{ padding: '1rem', fontWeight: '600', color: '#28a745' }}>${service.price}</td>
                          <td style={{ padding: '1rem' }}>
                            <span style={{
                              padding: '0.25rem 0.75rem',
                              borderRadius: '12px',
                              fontSize: '0.75rem',
                              fontWeight: '600',
                              backgroundColor: service.is_active ? '#d4edda' : '#f8d7da',
                              color: service.is_active ? '#155724' : '#721c24'
                            }}>
                              {service.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td style={{ padding: '1rem' }}>
                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                              <button 
                                onClick={() => handleEdit(service)} 
                                style={{
                                  padding: '0.375rem 0.75rem',
                                  border: 'none',
                                  borderRadius: '4px',
                                  backgroundColor: '#007bff',
                                  color: 'white',
                                  fontSize: '0.875rem',
                                  cursor: 'pointer',
                                  transition: 'background-color 0.2s'
                                }}
                                onMouseOver={(e) => e.target.style.backgroundColor = '#0056b3'}
                                onMouseOut={(e) => e.target.style.backgroundColor = '#007bff'}
                              >
                                Edit
                              </button>
                              <button 
                                onClick={() => handleToggleActive(service)} 
                                style={{
                                  padding: '0.375rem 0.75rem',
                                  border: 'none',
                                  borderRadius: '4px',
                                  backgroundColor: service.is_active ? '#ffc107' : '#28a745',
                                  color: service.is_active ? '#212529' : 'white',
                                  fontSize: '0.875rem',
                                  cursor: 'pointer',
                                  transition: 'background-color 0.2s'
                                }}
                              >
                                {service.is_active ? 'Deactivate' : 'Activate'}
                              </button>
                              <button 
                                onClick={() => handleDelete(service.id)} 
                                style={{
                                  padding: '0.375rem 0.75rem',
                                  border: 'none',
                                  borderRadius: '4px',
                                  backgroundColor: '#dc3545',
                                  color: 'white',
                                  fontSize: '0.875rem',
                                  cursor: 'pointer',
                                  transition: 'background-color 0.2s'
                                }}
                                onMouseOver={(e) => e.target.style.backgroundColor = '#c82333'}
                                onMouseOut={(e) => e.target.style.backgroundColor = '#dc3545'}
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div>
          <div style={styles.headerControls}>
            <button 
              onClick={() => navigate(`/provider/dashboard/${user.id}`)}
              style={styles.backButton}
              onMouseOver={(e) => {
                e.currentTarget.style.background = '#2980b9';
                e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = '#3498db';
                e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
              }}
            >
              <span style={styles.backButtonIcon}>←</span>
              Return to Dashboard
            </button>
          </div>
          
          <div style={{ ...styles.fullWidthCard, maxWidth: '900px', margin: '0 auto' }}>
            <header className="create-service-header">
              <h1>{editingService ? 'Edit Service' : 'Add a New Service'}</h1>
              <p>{editingService ? 'Update your service details' : 'Select from our catalog of services and set your own price'}</p>
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
                  disabled={editingService}
                >
                  <option value="">Select a category</option>
                  {SERVICE_CATEGORIES.map(category => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                {editingService && <small className="form-hint">Category cannot be changed when editing</small>}
              </div>
              
              {selectedCategory && !editingService && (
                <div className="form-group">
                  <label>Select a Service</label>
                  <div className="service-options-container">
                    {availableServices.length > 0 ? (
                      availableServices.map(service => (
                        <div 
                          key={service.name}
                          className={`service-option-card ${selectedService?.name === service.name ? 'selected' : ''}`}
                          onClick={() => handleServiceCardClick(service)}
                        >
                          <div className="service-option-name">{service.name}</div>
                          <div className="service-option-price">${service.minPrice} - ${service.maxPrice}</div>
                        </div>
                      ))
                    ) : (
                      <div className="no-services-message">No services available in this category</div>
                    )}
                  </div>
                  {!selectedService && availableServices.length > 0 && (
                    <small className="form-hint">Click on a service to select it</small>
                  )}
                </div>
              )}
              
              {(selectedService || editingService) && (
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
                      readOnly={editingService}
                      disabled={editingService}
                    />
                    {editingService && <small className="form-hint">Service title cannot be changed</small>}
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
                      Your Price {selectedService && `($${selectedService.minPrice} - $${selectedService.maxPrice})`}
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
                        min={selectedService?.minPrice || 0}
                        max={selectedService?.maxPrice || 10000}
                        required
                        className="price-input"
                      />
                    </div>
                    {selectedService && (
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
                    )}
                  </div>
                </>
              )}
              
              <div className="form-actions">
                <button 
                  type="button" 
                  onClick={handleToggleForm}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={loading || (!selectedService && !editingService)}
                >
                  {loading ? (editingService ? 'Updating...' : 'Creating...') : (editingService ? 'Update Service' : 'Create Service')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManageServices; 