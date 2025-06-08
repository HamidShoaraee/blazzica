import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/ServiceCatalog.css';

// Hard-coded service data from CSV since importing CSV directly isn't working
const csvServiceData = [
  { category: "Hair Colour Services & Highlight", name: "Root Touch-Up", minPrice: 80, maxPrice: 150 },
  { category: "Hair Colour Services & Highlight", name: "Full Hair Color", minPrice: 100, maxPrice: 200 },
  { category: "Hair Colour Services & Highlight", name: "Balayage", minPrice: 150, maxPrice: 300 },
  { category: "Hair Colour Services & Highlight", name: "Ombre", minPrice: 140, maxPrice: 280 },
  { category: "Hair Colour Services & Highlight", name: "Partial Highlights", minPrice: 120, maxPrice: 200 },
  { category: "Hair Colour Services & Highlight", name: "Full Highlights", minPrice: 145, maxPrice: 280 },
  { category: "Hair Treatment", name: "Deep Conditioning", minPrice: 50, maxPrice: 100 },
  { category: "Hair Treatment", name: "Keratin Treatment", minPrice: 150, maxPrice: 250 },
  { category: "Hair Treatment", name: "Scalp Treatment", minPrice: 60, maxPrice: 120 },
  { category: "Hair Treatment", name: "Olaplex Treatment", minPrice: 70, maxPrice: 130 },
  { category: "Hair Treatment", name: "Protein Therapy", minPrice: 60, maxPrice: 100 },
  { category: "Haircuts, crops, hair removal, blow", name: "Women's Haircut", minPrice: 50, maxPrice: 90 },
  { category: "Haircuts, crops, hair removal, blow", name: "Men's Haircut", minPrice: 40, maxPrice: 70 },
  { category: "Haircuts, crops, hair removal, blow", name: "Kid's Haircut", minPrice: 30, maxPrice: 50 },
  { category: "Haircuts, crops, hair removal, blow", name: "Blowout", minPrice: 40, maxPrice: 80 },
  { category: "Haircuts, crops, hair removal, blow", name: "Facial Waxing/Threading", minPrice: 20, maxPrice: 50 },
  { category: "Hair extensions and braids", name: "Clip-in Extensions", minPrice: 100, maxPrice: 200 },
  { category: "Hair extensions and braids", name: "Tape-in Extensions", minPrice: 150, maxPrice: 300 },
  { category: "Hair extensions and braids", name: "Sew-in Extensions", minPrice: 200, maxPrice: 400 },
  { category: "Hair extensions and braids", name: "Box Braids", minPrice: 150, maxPrice: 300 },
  { category: "Hair extensions and braids", name: "Cornrows", minPrice: 100, maxPrice: 200 },
  { category: "Hair extensions and braids", name: "Dreadlocks", minPrice: 200, maxPrice: 500 },
  { category: "Nail services", name: "Classic Manicure", minPrice: 30, maxPrice: 60 },
  { category: "Nail services", name: "Classic Pedicure", minPrice: 40, maxPrice: 70 },
  { category: "Nail services", name: "Gel Manicure", minPrice: 50, maxPrice: 80 },
  { category: "Nail services", name: "Acrylic Nails", minPrice: 60, maxPrice: 100 },
  { category: "Nail services", name: "Shellac Nails", minPrice: 50, maxPrice: 90 },
  { category: "Nail services", name: "Nail Art", minPrice: 20, maxPrice: 50 },
  { category: "Nail services", name: "Nail Extensions", minPrice: 70, maxPrice: 120 },
  { category: "Eyelash & Eyebrow services", name: "Eyebrow Tinting", minPrice: 25, maxPrice: 50 },
  { category: "Eyelash & Eyebrow services", name: "Eyelash Tinting", minPrice: 30, maxPrice: 60 },
  { category: "Eyelash & Eyebrow services", name: "Lash Lift", minPrice: 60, maxPrice: 100 },
  { category: "Eyelash & Eyebrow services", name: "Lash Extensions", minPrice: 100, maxPrice: 180 },
  { category: "Eyelash & Eyebrow services", name: "Eyebrow Threading", minPrice: 20, maxPrice: 40 },
  { category: "Eyelash & Eyebrow services", name: "Brow Lamination", minPrice: 50, maxPrice: 90 },
  { category: "Eyelash & Eyebrow services", name: "Microblading", minPrice: 200, maxPrice: 400 },
  { category: "Facial services", name: "Classic Facial", minPrice: 60, maxPrice: 120 },
  { category: "Facial services", name: "Anti-Aging Facial", minPrice: 80, maxPrice: 150 },
  { category: "Facial services", name: "Hydrafacial", minPrice: 120, maxPrice: 200 },
  { category: "Facial services", name: "Chemical Peel", minPrice: 100, maxPrice: 180 },
  { category: "Facial services", name: "Acne Treatment Facial", minPrice: 80, maxPrice: 150 },
  { category: "Aesthetic treatments and Tattoo services", name: "Botox (per area)", minPrice: 100, maxPrice: 200 },
  { category: "Aesthetic treatments and Tattoo services", name: "Fillers (per syringe)", minPrice: 300, maxPrice: 600 },
  { category: "Aesthetic treatments and Tattoo services", name: "Microneedling", minPrice: 150, maxPrice: 300 },
  { category: "Aesthetic treatments and Tattoo services", name: "Semi-permanent Makeup", minPrice: 300, maxPrice: 600 },
  { category: "Aesthetic treatments and Tattoo services", name: "Tattoo (small)", minPrice: 100, maxPrice: 300 },
  { category: "Aesthetic treatments and Tattoo services", name: "Tattoo (large)", minPrice: 300, maxPrice: 800 },
  { category: "Makeup and Chignon Services", name: "Event Makeup", minPrice: 80, maxPrice: 150 },
  { category: "Makeup and Chignon Services", name: "Bridal Makeup", minPrice: 150, maxPrice: 300 },
  { category: "Makeup and Chignon Services", name: "Casual Makeup", minPrice: 70, maxPrice: 120 },
  { category: "Makeup and Chignon Services", name: "Chignon Styling", minPrice: 100, maxPrice: 200 },
  { category: "Makeup and Chignon Services", name: "Hair Updos", minPrice: 90, maxPrice: 180 },
  { category: "Massage services", name: "Swedish Massage", minPrice: 80, maxPrice: 140 },
  { category: "Massage services", name: "Deep Tissue Massage", minPrice: 100, maxPrice: 160 },
  { category: "Massage services", name: "Prenatal Massage", minPrice: 90, maxPrice: 150 },
  { category: "Massage services", name: "Hot Stone Massage", minPrice: 100, maxPrice: 160 },
  { category: "Massage services", name: "Reflexology", minPrice: 60, maxPrice: 100 },
  { category: "Pet Grooming Services", name: "Basic Bath & Brush", minPrice: 40, maxPrice: 70 },
  { category: "Pet Grooming Services", name: "Haircut & Style", minPrice: 60, maxPrice: 120 },
  { category: "Pet Grooming Services", name: "Nail Trimming", minPrice: 20, maxPrice: 40 },
  { category: "Pet Grooming Services", name: "De-shedding Treatment", minPrice: 50, maxPrice: 100 },
  { category: "Pet Grooming Services", name: "Flea/Tick Treatment", minPrice: 60, maxPrice: 120 },
  { category: "Pet Grooming Services", name: "Ear Cleaning", minPrice: 20, maxPrice: 40 },
  { category: "Pet Grooming Services", name: "Full Grooming Package", minPrice: 100, maxPrice: 200 }
];

const ServiceCatalog = () => {
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Use the hard-coded data instead of trying to parse CSV
    try {
      const categoriesSet = new Set(csvServiceData.map(service => service.category));
      
      setServices(csvServiceData);
      setCategories(Array.from(categoriesSet));
    } catch (error) {
      console.error('Error processing service data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Filter services based on selected category and search term
  const filteredServices = services.filter(service => {
    const matchesCategory = selectedCategory === 'all' || service.category === selectedCategory;
    const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          service.category.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Group services by category for display
  const servicesByCategory = filteredServices.reduce((acc, service) => {
    if (!acc[service.category]) {
      acc[service.category] = [];
    }
    acc[service.category].push(service);
    return acc;
  }, {});

  if (loading) {
    return <div className="loading-container">Loading services...</div>;
  }

  return (
    <div className="service-catalog-container">
      <div className="catalog-header">
        <h1>Beauty & Wellness Services</h1>
        <p>Explore our range of professional services and book your appointment today</p>
        
        <div className="search-filter-container">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search services..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <i className="search-icon">🔍</i>
          </div>
          
          <div className="category-filter">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="all">All Categories</option>
              {categories.map((category, index) => (
                <option key={index} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="horizontal-services-layout">
        {selectedCategory === 'all' ? (
          // Display all categories when "All Categories" is selected
          Object.entries(servicesByCategory).map(([category, categoryServices]) => (
            <div key={category} className="category-section">
              <h2 className="category-title">{category}</h2>
              <div className="horizontal-services-list">
                {categoryServices.map((service, index) => (
                  <div key={index} className="service-card">
                    <h3>{service.name}</h3>
                    <div className="price-range">
                      ${service.minPrice} - ${service.maxPrice}
                    </div>
                    <Link 
                      to={`/services/details/${encodeURIComponent(service.name)}`} 
                      className="view-providers-btn"
                    >
                      View Providers
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          // Display only the selected category
          <div className="category-section">
            <h2 className="category-title">{selectedCategory}</h2>
            <div className="horizontal-services-list">
              {servicesByCategory[selectedCategory]?.map((service, index) => (
                <div key={index} className="service-card">
                  <h3>{service.name}</h3>
                  <div className="price-range">
                    ${service.minPrice} - ${service.maxPrice}
                  </div>
                  <Link 
                    to={`/services/details/${encodeURIComponent(service.name)}`} 
                    className="view-providers-btn"
                  >
                    View Providers
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ServiceCatalog; 