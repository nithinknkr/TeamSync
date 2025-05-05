import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaTasks, FaUsers, FaCalendarAlt, FaComments, FaVideo, FaChevronDown } from 'react-icons/fa';
import Logo from '../components/Logo';

const LandingPage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [isVisible, setIsVisible] = useState({
    features: false,
    howItWorks: false,
    cta: false
  });

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  useEffect(() => {
    const handleScroll = () => {
      const position = window.pageYOffset;
      setScrollPosition(position);
      
      // Check visibility of sections for animations
      const featuresSection = document.getElementById('features');
      const howItWorksSection = document.getElementById('how-it-works');
      const ctaSection = document.querySelector('.cta-section');
      
      if (featuresSection && isElementInViewport(featuresSection) && !isVisible.features) {
        setIsVisible(prev => ({ ...prev, features: true }));
      }
      
      if (howItWorksSection && isElementInViewport(howItWorksSection) && !isVisible.howItWorks) {
        setIsVisible(prev => ({ ...prev, howItWorks: true }));
      }
      
      if (ctaSection && isElementInViewport(ctaSection) && !isVisible.cta) {
        setIsVisible(prev => ({ ...prev, cta: true }));
      }
    };
    
    const isElementInViewport = (el) => {
      const rect = el.getBoundingClientRect();
      return (
        rect.top <= (window.innerHeight || document.documentElement.clientHeight) * 0.75
      );
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isVisible]);

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Navigation - with scroll effect */}
      <nav className={`fixed w-full z-50 transition-all duration-300 ${scrollPosition > 50 ? 'bg-white shadow-md py-2' : 'bg-transparent py-4'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Logo theme={scrollPosition > 50 ? 'dark' : 'light'} />
              <div className="hidden md:ml-10 md:flex md:space-x-8">
                <a href="#features" className="group relative inline-flex items-center px-1 py-2 text-sm font-medium text-gray-900 hover:text-black transition-colors duration-300">
                  Features
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-black transition-all duration-300 group-hover:w-full"></span>
                </a>
                <a href="#how-it-works" className="group relative inline-flex items-center px-1 py-2 text-sm font-medium text-gray-900 hover:text-black transition-colors duration-300">
                  How It Works
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-black transition-all duration-300 group-hover:w-full"></span>
                </a>
                <a href="#testimonials" className="group relative inline-flex items-center px-1 py-2 text-sm font-medium text-gray-900 hover:text-black transition-colors duration-300">
                  Testimonials
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-black transition-all duration-300 group-hover:w-full"></span>
                </a>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <Link to="/login" className="relative overflow-hidden inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-900 bg-white hover:bg-gray-50 transition-all duration-300 group">
                <span className="relative z-10">Log in</span>
                <span className="absolute bottom-0 left-0 w-0 h-full bg-black transition-all duration-300 group-hover:w-full"></span>
                <span className="absolute bottom-0 left-0 w-0 h-full bg-gray-100 opacity-20 transition-all duration-500 group-hover:w-full"></span>
              </Link>
              <Link to="/signup" className="relative overflow-hidden inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-black hover:bg-gray-800 transition-all duration-300 shadow-lg hover:shadow-xl">
                <span className="relative z-10">Sign up</span>
                <span className="absolute top-0 left-0 w-full h-0 bg-gray-700 transition-all duration-300 hover:h-full"></span>
              </Link>
            </div>
            <div className="md:hidden flex items-center">
              <button
                onClick={toggleMenu}
                type="button"
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-black hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-black transition-colors duration-300"
                aria-expanded="false"
              >
                <span className="sr-only">Open main menu</span>
                {!isMenuOpen ? (
                  <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                ) : (
                  <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu - with animation */}
        <div className={`md:hidden absolute w-full bg-white shadow-lg transition-all duration-300 ease-in-out transform ${isMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10 pointer-events-none'}`}>
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <a href="#features" className="block px-3 py-2 rounded-md text-base font-medium text-gray-900 hover:bg-gray-100 hover:text-black transition-colors duration-300">
              Features
            </a>
            <a href="#how-it-works" className="block px-3 py-2 rounded-md text-base font-medium text-gray-900 hover:bg-gray-100 hover:text-black transition-colors duration-300">
              How It Works
            </a>
            <a href="#testimonials" className="block px-3 py-2 rounded-md text-base font-medium text-gray-900 hover:bg-gray-100 hover:text-black transition-colors duration-300">
              Testimonials
            </a>
          </div>
          <div className="pt-4 pb-3 border-t border-gray-200">
            <div className="flex items-center px-5 space-x-3">
              <Link to="/login" className="block w-full px-4 py-2 text-center text-base font-medium text-gray-900 hover:bg-gray-100 hover:text-black transition-colors duration-300">
                Log in
              </Link>
              <Link to="/signup" className="block w-full px-4 py-2 text-center text-base font-medium text-white bg-black rounded-md hover:bg-gray-800 transition-colors duration-300">
                Sign up
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section - with animations */}
      <div className="relative pt-16 pb-32 flex content-center items-center justify-center" style={{ minHeight: "100vh" }}>
        <div className="absolute top-0 w-full h-full bg-center bg-cover" style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-1.2.1&auto=format&fit=crop&w=2850&q=80')",
        }}>
          <span className="w-full h-full absolute opacity-50 bg-black"></span>
        </div>
        <div className="container relative mx-auto">
          <div className="items-center flex flex-wrap">
            <div className="w-full lg:w-6/12 px-4 ml-auto mr-auto text-center">
              <div className="animate-fadeIn">
                <h1 className="text-white font-semibold text-5xl mb-8 leading-tight">
                  Streamline Your Team Projects
                </h1>
                <p className="mt-4 text-lg text-gray-300">
                  Manage tasks, collaborate with your team, and boost productivity with our comprehensive project management platform.
                </p>
                <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
                  <Link to="/signup" className="relative overflow-hidden inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-black bg-white hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-lg">
                    <span className="relative z-10">Get started</span>
                    <span className="absolute bottom-0 left-0 w-0 h-full bg-gray-200 transition-all duration-500 group-hover:w-full"></span>
                  </Link>
                  <a href="#features" className="relative overflow-hidden inline-flex items-center justify-center px-8 py-3 border border-white text-base font-medium rounded-md text-white bg-transparent hover:bg-white hover:text-black transition-all duration-300 transform hover:scale-105">
                    Learn more
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
          <a href="#features" className="text-white">
            <FaChevronDown className="h-8 w-8" />
          </a>
        </div>
      </div>

      {/* Features Section - with scroll animations */}
      <div id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base font-semibold tracking-wide uppercase border-b-2 border-black inline-block pb-1">Features</h2>
            <p className="mt-2 text-3xl font-extrabold text-gray-900 sm:text-4xl sm:tracking-tight lg:text-5xl">
              Everything you need to manage your projects
            </p>
            <p className="mt-5 max-w-2xl mx-auto text-xl text-gray-500">
              Our platform provides comprehensive tools for task management, team collaboration, and project tracking.
            </p>
          </div>

          <div className="mt-16">
            <div className="space-y-12 lg:space-y-0 lg:grid lg:grid-cols-3 lg:gap-x-8">
              {[
                {
                  icon: <FaTasks className="h-8 w-8" />,
                  title: "Task Management",
                  description: "Create, assign, and track tasks with priorities, due dates, and status updates. Create subtasks for complex projects."
                },
                {
                  icon: <FaUsers className="h-8 w-8" />,
                  title: "Team Collaboration",
                  description: "Invite team members, assign tasks, and communicate effectively within project workspaces."
                },
                {
                  icon: <FaCalendarAlt className="h-8 w-8" />,
                  title: "Calendar & Deadlines",
                  description: "View upcoming deadlines and meetings in a calendar view. Get notified about approaching deadlines."
                },
                {
                  icon: <FaComments className="h-8 w-8" />,
                  title: "Communication Tools",
                  description: "Project chatrooms, personal messaging, and notification systems to keep everyone in the loop."
                },
                {
                  icon: <FaVideo className="h-8 w-8" />,
                  title: "Video Meetings",
                  description: "Schedule and conduct video calls with your team members directly from the platform."
                },
                {
                  icon: <FaTasks className="h-8 w-8" />,
                  title: "Project Dashboard",
                  description: "Get a comprehensive overview of all your projects, tasks, and team activities in one place."
                }
              ].map((feature, index) => (
                <div 
                  key={index} 
                  className={`group relative bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-black rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform ${isVisible.features ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-center justify-center h-16 w-16 rounded-md bg-black text-white mb-4 transform group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 group-hover:text-black transition-colors duration-300">{feature.title}</h3>
                  <p className="mt-2 text-base text-gray-500 group-hover:text-gray-700 transition-colors duration-300">{feature.description}</p>
                  <div className="mt-4 w-0 group-hover:w-full h-0.5 bg-black transition-all duration-300"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* How It Works Section - with animations */}
      <div id="how-it-works" className="bg-gray-50 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base font-semibold tracking-wide uppercase border-b-2 border-black inline-block pb-1">How It Works</h2>
            <p className="mt-2 text-3xl font-extrabold text-gray-900 sm:text-4xl sm:tracking-tight lg:text-5xl">
              Simple steps to boost your team's productivity
            </p>
          </div>

          <div className="mt-16">
            <div className="relative">
              {/* Timeline line */}
              <div className="hidden lg:block absolute left-1/2 transform -translate-x-1/2 h-full w-0.5 bg-gray-300"></div>
              
              {/* Steps */}
              <div className="space-y-16">
                {[
                  {
                    number: "01",
                    title: "Create a Project",
                    description: "Set up your project workspace and invite team members to join via email.",
                    image: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
                  },
                  {
                    number: "02",
                    title: "Assign Tasks",
                    description: "Create and assign tasks to team members with priorities, due dates, and descriptions.",
                    image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
                  },
                  {
                    number: "03",
                    title: "Collaborate & Track",
                    description: "Communicate with your team, track progress, and meet deadlines efficiently.",
                    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
                  }
                ].map((step, index) => (
                  <div 
                    key={index} 
                    className={`relative flex flex-col lg:flex-row items-center ${index % 2 === 1 ? 'lg:flex-row-reverse' : ''} ${isVisible.howItWorks ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                    style={{ transitionDelay: `${index * 200}ms`, transitionDuration: '700ms', transitionProperty: 'all' }}
                  >
                    <div className="flex-1 lg:text-right lg:pr-8">
                      <div className={`lg:hidden absolute top-0 left-9 h-full w-0.5 bg-gray-300 ${index === 2 ? 'hidden' : ''}`}></div>
                      <div className="flex items-center lg:justify-end">
                        <div className="flex items-center justify-center h-16 w-16 rounded-full bg-black text-white text-xl font-bold z-10">
                          {step.number}
                        </div>
                      </div>
                      <h3 className="mt-4 text-2xl font-bold text-gray-900">{step.title}</h3>
                      <p className="mt-2 text-lg text-gray-500">{step.description}</p>
                    </div>
                    <div className="hidden lg:block flex-shrink-0 w-16 h-16 rounded-full bg-gray-100 border-4 border-white z-10"></div>
                    <div className="flex-1 mt-6 lg:mt-0 lg:pl-8">
                      <div className="rounded-lg overflow-hidden shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
                        <img src={step.image} alt={step.title} className="w-full h-64 object-cover" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div id="testimonials" className="bg-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base font-semibold tracking-wide uppercase border-b-2 border-black inline-block pb-1">Testimonials</h2>
            <p className="mt-2 text-3xl font-extrabold text-gray-900 sm:text-4xl sm:tracking-tight lg:text-5xl">
              What our customers say
            </p>
          </div>

          <div className="mt-16 grid gap-8 lg:grid-cols-3">
            {[
              {
                quote: "TeamSync has transformed how our team collaborates. We've seen a 40% increase in productivity since implementing it.",
                author: "Sarah Johnson",
                role: "Project Manager, TechCorp",
                avatar: "https://randomuser.me/api/portraits/women/32.jpg"
              },
              {
                quote: "The intuitive interface and powerful features make this the best project management tool we've ever used.",
                author: "Michael Chen",
                role: "CTO, StartupX",
                avatar: "https://randomuser.me/api/portraits/men/46.jpg"
              },
              {
                quote: "Our remote team finally feels connected. The communication tools are seamless and the task tracking is exceptional.",
                author: "Emily Rodriguez",
                role: "Team Lead, DesignHub",
                avatar: "https://randomuser.me/api/portraits/women/65.jpg"
              }
            ].map((testimonial, index) => (
              <div 
                key={index} 
                className="bg-gray-50 rounded-lg p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="relative">
                  <svg className="absolute top-0 left-0 transform -translate-x-6 -translate-y-8 h-16 w-16 text-gray-200" fill="currentColor" viewBox="0 0 32 32" aria-hidden="true">
                    <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
                  </svg>
                  <p className="relative text-lg font-medium text-gray-900 mt-8">
                    {testimonial.quote}
                  </p>
                </div>
                <div className="mt-6 flex items-center">
                  <div className="flex-shrink-0">
                    <img className="h-12 w-12 rounded-full" src={testimonial.avatar} alt={testimonial.author} />
                  </div>
                  <div className="ml-4">
                    <div className="text-base font-medium text-gray-900">{testimonial.author}</div>
                    <div className="text-sm text-gray-500">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section - with animation */}
      <div className="cta-section bg-black py-16 sm:py-24">
        <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 transition-all duration-1000 transform ${isVisible.cta ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="relative rounded-2xl overflow-hidden">
            <div className="absolute inset-0">
              <img className="w-full h-full object-cover" src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?ixlib=rb-1.2.1&auto=format&fit=crop&w=2850&q=80" alt="People working on laptops" />
              <div className="absolute inset-0 bg-black opacity-75"></div>
            </div>
            <div className="relative py-16 px-6 sm:py-24 sm:px-12 lg:px-16">
              <div className="text-center">
                <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
                  <span className="block">Ready to streamline your projects?</span>
                  <span className="block mt-2">Start using TeamSync today.</span>
                </h2>
                <p className="mt-4 text-lg leading-6 text-gray-300">
                  Join thousands of teams who have improved their productivity with our project management solution.
                </p>
                <Link to="/signup" className="mt-8 inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-black bg-white hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-lg">
                  Sign up for free
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white">
        <div className="max-w-7xl mx-auto py-12 px-4 overflow-hidden sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase">Product</h3>
              <ul className="mt-4 space-y-4">
                <li>
                  <a href="#" className="text-base text-gray-500 hover:text-black transition-colors duration-300">Features</a>
                </li>
                <li>
                  <a href="#" className="text-base text-gray-500 hover:text-black transition-colors duration-300">Pricing</a>
                </li>
                <li>
                  <a href="#" className="text-base text-gray-500 hover:text-black transition-colors duration-300">Integrations</a>
                </li>
                <li>
                  <a href="#" className="text-base text-gray-500 hover:text-black transition-colors duration-300">Updates</a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase">Company</h3>
              <ul className="mt-4 space-y-4">
                <li>
                  <a href="#" className="text-base text-gray-500 hover:text-black transition-colors duration-300">About</a>
                </li>
                <li>
                  <a href="#" className="text-base text-gray-500 hover:text-black transition-colors duration-300">Blog</a>
                </li>
                <li>
                  <a href="#" className="text-base text-gray-500 hover:text-black transition-colors duration-300">Careers</a>
                </li>
                <li>
                  <a href="#" className="text-base text-gray-500 hover:text-black transition-colors duration-300">Press</a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase">Resources</h3>
              <ul className="mt-4 space-y-4">
                <li>
                  <a href="#" className="text-base text-gray-500 hover:text-black transition-colors duration-300">Documentation</a>
                </li>
                <li>
                  <a href="#" className="text-base text-gray-500 hover:text-black transition-colors duration-300">Guides</a>
                </li>
                <li>
                  <a href="#" className="text-base text-gray-500 hover:text-black transition-colors duration-300">Support</a>
                </li>
                <li>
                  <a href="#" className="text-base text-gray-500 hover:text-black transition-colors duration-300">API</a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase">Legal</h3>
              <ul className="mt-4 space-y-4">
                <li>
                  <a href="#" className="text-base text-gray-500 hover:text-black transition-colors duration-300">Privacy</a>
                </li>
                <li>
                  <a href="#" className="text-base text-gray-500 hover:text-black transition-colors duration-300">Terms</a>
                </li>
                <li>
                  <a href="#" className="text-base text-gray-500 hover:text-black transition-colors duration-300">Cookie Policy</a>
                </li>
                <li>
                  <a href="#" className="text-base text-gray-500 hover:text-black transition-colors duration-300">Contact</a>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-12 border-t border-gray-200 pt-8">
            <p className="text-base text-gray-400 text-center">
              &copy; 2024 TeamSync. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;