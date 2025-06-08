const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Mock data
const services = [
  {
    id: 1,
    title: "Hair Styling",
    description: "Professional cuts, coloring, and styling services by experienced hairdressers in the comfort of your home.",
    image: "https://images.unsplash.com/photo-1560066984-138dadb4c035?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 2,
    title: "Makeup Services",
    description: "From natural looks to glamorous styles, our makeup artists create the perfect look for any occasion.",
    image: "https://images.unsplash.com/photo-1487412912498-0447579c8d4d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 3,
    title: "Nail Care",
    description: "Manicures, pedicures, and nail art by skilled technicians using premium products and tools.",
    image: "https://images.unsplash.com/photo-1519014816548-bf5fe059798b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 4,
    title: "Skin Care",
    description: "Facials, treatments, and skincare routines tailored to your skin type and concerns.",
    image: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 5,
    title: "Massage",
    description: "Relaxing and therapeutic massages to help you unwind and relieve stress in your own space.",
    image: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
  }
];

const testimonials = [
  {
    id: 1,
    name: "Sarah Johnson",
    role: "Regular Client",
    text: "Blazzica transformed my beauty routine! Having a professional come to my home saved me so much time and the quality was exceptional.",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=150&q=80",
    stars: 5
  },
  {
    id: 2,
    name: "Michael Rodriguez",
    role: "Beauty Professional",
    text: "As a beauty professional, this platform has helped me connect with new clients and grow my business in a flexible way that works with my schedule.",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=150&q=80",
    stars: 5
  },
  {
    id: 3,
    name: "Emily Parker",
    role: "Monthly Subscriber",
    text: "The convenience of having a skilled beautician come to my home has been incredible. Great service, competitive prices!",
    image: "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?ixlib=rb-1.2.1&auto=format&fit=crop&w=150&q=80",
    stars: 5
  },
  {
    id: 4,
    name: "David Thompson",
    role: "First-time Client",
    text: "I was skeptical at first but now I'm a regular client. Professional, punctual, and perfect results every time.",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=crop&w=150&q=80",
    stars: 4.5
  },
  {
    id: 5,
    name: "Jessica Williams",
    role: "Event Preparation",
    text: "My makeup artist was amazing! She listened to what I wanted and delivered even better results than I expected for my special event.",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=crop&w=150&q=80",
    stars: 5
  }
];

const heroData = {
  caption: "Professional Services At Your Doorstep",
  title: "Quality Services Delivered To Your Home",
  description: "Experience professional services in the comfort of your own home. Our skilled service providers deliver quality treatments and care directly to you, whether it's beauty, wellness, or pet care services."
};

// Store email subscriptions
let subscribers = [];

// API Routes
app.get('/api/services', (req, res) => {
  // Simulate network delay
  setTimeout(() => {
    res.json(services);
  }, 800);
});

app.get('/api/services/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const service = services.find(s => s.id === id);
  
  if (!service) {
    return res.status(404).json({ message: 'Service not found' });
  }
  
  res.json(service);
});

app.get('/api/testimonials', (req, res) => {
  // Simulate network delay
  setTimeout(() => {
    res.json(testimonials);
  }, 600);
});

app.get('/api/hero', (req, res) => {
  res.json(heroData);
});

app.post('/api/subscribe', (req, res) => {
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }
  
  // Check if already subscribed
  if (subscribers.includes(email)) {
    return res.status(400).json({ message: 'Email already subscribed' });
  }
  
  // Add to subscribers
  subscribers.push(email);
  
  // Simulate network delay
  setTimeout(() => {
    res.status(201).json({ message: 'Successfully subscribed', email });
  }, 1000);
});

// Professionals API
app.get('/api/professionals', (req, res) => {
  const professionals = [
    {
      id: 1,
      name: "Amanda Silva",
      specialty: "Hair Stylist",
      rating: 4.9,
      reviews: 128,
      image: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80",
      bio: "Specialized in cutting, coloring, and styling for all hair types with over 8 years of experience."
    },
    {
      id: 2,
      name: "James Chen",
      specialty: "Makeup Artist",
      rating: 4.8,
      reviews: 94,
      image: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80",
      bio: "Celebrity makeup artist with expertise in both natural everyday looks and dramatic event makeup."
    },
    {
      id: 3,
      name: "Priya Patel",
      specialty: "Nail Technician",
      rating: 4.7,
      reviews: 76,
      image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80",
      bio: "Advanced nail art specialist offering gel, acrylic, and traditional manicure and pedicure services."
    },
    {
      id: 4,
      name: "Marcus Johnson",
      specialty: "Massage Therapist",
      rating: 4.9,
      reviews: 112,
      image: "https://images.unsplash.com/photo-1531384441138-2736e62e0919?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80",
      bio: "Licensed massage therapist specializing in Swedish, deep tissue, and sports massage therapy."
    }
  ];
  
  // Simulate network delay
  setTimeout(() => {
    res.json(professionals);
  }, 800);
});

// Auth routes (mock)
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  
  // Mock validation
  if (email === 'user@example.com' && password === 'password123') {
    res.json({
      success: true,
      token: 'mock-jwt-token-xyz',
      user: {
        name: 'Jane Doe',
        email: 'user@example.com',
        role: 'client',
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=150&q=80"
      }
    });
  } else {
    res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 