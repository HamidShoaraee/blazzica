import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProviderById, getServices } from '../utils/api';

function ProviderDetail() {
  const { id } = useParams();
  const [provider, setProvider] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProviderDetails = async () => {
      try {
        setLoading(true);
        
        // Get provider details
        const providerData = await getProviderById(id);
        setProvider(providerData);
        
        // Get provider's services
        const servicesData = await getServices({ provider_id: id });
        setServices(servicesData);
      } catch (err) {
        setError('Failed to load provider details. Please try again later.');
        console.error('Error fetching provider details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProviderDetails();
  }, [id]);

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '50px' }}>Loading provider details...</div>;
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  if (!provider) {
    return <div className="alert alert-danger">Provider not found.</div>;
  }

  return (
    <div>
      <div className="card" style={{ marginBottom: '30px', padding: '30px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '30px' }}>
          <div style={{ 
            width: '120px', 
            height: '120px', 
            backgroundColor: '#e9ecef', 
            borderRadius: '50%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            fontSize: '2rem',
            color: '#6c757d'
          }}>
            {provider.avatar_url ? (
              <img 
                src={provider.avatar_url} 
                alt={provider.full_name} 
                style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
              />
            ) : (
              provider.full_name?.charAt(0) || 'P'
            )}
          </div>
          
          <div>
            <h1 style={{ marginBottom: '10px' }}>{provider.full_name}</h1>
            {provider.specialties && provider.specialties.length > 0 && (
              <div style={{ display: 'flex', gap: '5px', marginBottom: '15px', flexWrap: 'wrap' }}>
                {provider.specialties.map(specialty => (
                  <span key={specialty} className="badge badge-primary">{specialty}</span>
                ))}
              </div>
            )}
            {provider.bio && <p style={{ marginBottom: '15px' }}>{provider.bio}</p>}
            
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
              {provider.location && (
                <div>
                  <strong>Location:</strong> {provider.location}
                </div>
              )}
              {provider.years_of_experience && (
                <div>
                  <strong>Experience:</strong> {provider.years_of_experience} years
                </div>
              )}
              {provider.ratings_average && (
                <div>
                  <strong>Rating:</strong> {provider.ratings_average} ({provider.ratings_count} reviews)
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <h2>Services Offered</h2>
      
      {services.length === 0 ? (
        <div style={{ padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px', marginTop: '20px', textAlign: 'center' }}>
          <p>This provider doesn't have any services listed yet.</p>
        </div>
      ) : (
        <div className="grid" style={{ marginTop: '20px' }}>
          {services.map(service => (
            <div key={service.id} className="card">
              <h3 className="card-title">{service.title}</h3>
              <p>{service.description.substring(0, 100)}...</p>
              <div style={{ margin: '10px 0' }}>
                <span className="badge badge-primary">{service.category}</span>
                <span style={{ marginLeft: '10px', fontWeight: 'bold' }}>${service.price}</span>
              </div>
              <Link 
                to={`/services/${service.id}`}
                style={{ 
                  display: 'inline-block',
                  marginTop: '10px',
                  padding: '8px 16px',
                  background: '#4361ee',
                  color: 'white',
                  borderRadius: '4px',
                  textDecoration: 'none'
                }}
              >
                View Details
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ProviderDetail; 