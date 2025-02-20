import { Link } from "react-router-dom";
import bgImage from "../../assets/Img/bg1.webp";
import img1 from "../../assets/Img/Frame.webp";
import img2 from "../../assets/Img/key.webp";
import img3 from "../../assets/Img/cup.jpg";
import img4 from "../../assets/Img/wall.jpg";
import img5 from "../../assets/Img/Plaques.webp";
import img6 from "../../assets/Img/Scrapbooks.webp";
import img7 from "../../assets/Img/T-Shirts.avif";
import img8 from "../../assets/Img/Cases.jpg";
import logo from "../../components/Products/Navbar/logo.png";
import { motion } from "framer-motion";
import { useState } from "react";
import imgg from "../../assets/Img/giftt.png";
import tree from "../../assets/Img/tree.jpeg";
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from "react-icons/fa";

const Home = () => {
  const [buttonsVisible, setButtonsVisible] = useState(false); // State to control visibility of Login/Signup buttons

  const toggleButtons = () => {
    setButtonsVisible(!buttonsVisible); // Toggle visibility of Login/Signup buttons
  };
  const features = [
    {
      icon: img1,
      title: "Custom Frames",
      description:
        "Handcrafted frames designed to capture and showcase your cherished memories with a personal touch.",
    },
    {
      icon: img2,
      title: "Personalized Keychains",
      description:
        "Unique keychains customized with names, initials, or designs, making them the perfect keepsake.",
    },
    {
      icon: img3,
      title: "Customized Mugs",
      description:
        "Express yourself with beautifully designed mugs featuring personalized prints, quotes, or images.",
    },
    {
      icon: img4,
      title: "Artistic Wall Hangings",
      description:
        "Enhance your space with handcrafted wall decor, blending creativity and personalization.",
    },
  ];

  const gifts = [
    {
      icon: img5,
      title: "Engraved Wooden Plaques",
      description:
        "Beautifully crafted wooden plaques with custom engravings for special occasions and memories.",
    },
    {
      icon: img6,
      title: "Handmade Scrapbooks",
      description:
        "Custom-designed scrapbooks to preserve your cherished memories in a creative and personal way.",
    },
    {
      icon: img7,
      title: "Personalized T-Shirts",
      description:
        "Stylish and comfortable t-shirts featuring custom prints, quotes, or illustrations.",
    },
    {
      icon: img8,
      title: "Customized Phone Cases",
      description:
        "Express your personality with unique phone cases featuring custom artwork and designs.",
    },
  ];

  const testimonials = [
    {
      name: "Stella Larson",
      text: "Absolutely love the custom mug I ordered! The quality and attention to detail were beyond expectations.",
      date: "May 2024",
    },
    {
      name: "Nick Johnson",
      text: "Ordered a personalized keychain as a gift, and it was a huge hit! Great craftsmanship and timely delivery.",
      date: "June 2024",
    },
    {
      name: "Olga Ivanova",
      text: "The handmade frame I received was stunning. CustomHive truly brings creativity to life!",
      date: "May 2024",
    },
  ];

  return (
    <div>
      {/* Navbar */}

      <div className="bg-white shadow-md">
        <div className="container mx-auto flex justify-between items-center py-4 px-6">
          <h2
            className="font-bold text-l sm:text-3xl flex gap-2 items-center text-black py-1 px-2 rounded-md leading-tight"
            style={{ backgroundColor: "transparent" }}
          >
            CustomHive
            <img src={logo} alt="Logo" className="h-12" />
          </h2>

          <nav className="hidden md:flex items-center space-x-6">
            {["Home", "About Us", "Our Team", "Contact Us"].map((item) => (
              <a
                key={item}
                href="#"
                className="text-gray-800 hover:text-gray-600"
              >
                {item}
              </a>
            ))}

            {/* Login/Signup button and action buttons */}
            <div className="relative flex items-center space-x-4">
              {/* Login / Signup button */}
              <button
                onClick={toggleButtons} // Toggle visibility of Login/Signup buttons
                className="bg-blue-500 text-white px-4 py-2 rounded-md focus:outline-none"
              >
                Login / Signup
              </button>

              {/* Conditional rendering of Login/Signup buttons to the right */}
              {buttonsVisible && (
                <div className="flex space-x-4">
                  <Link
                    to="/login"
                    className="px-4 py-2 text-gray-800 hover:bg-gray-200 rounded-md"
                    onClick={() => setButtonsVisible(false)} // Close buttons when a link is clicked
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className="px-4 py-2 text-gray-800 hover:bg-gray-200 rounded-md"
                    onClick={() => setButtonsVisible(false)} // Close buttons when a link is clicked
                  >
                    Signup
                  </Link>
                </div>
              )}
            </div>
          </nav>
        </div>
      </div>

      {/* Hero Section */}
      <section>
        <div
          className="relative bg-cover bg-center h-[400px] flex items-center justify-center text-white text-4xl font-bold shadow-lg"
          style={{
            backgroundImage: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url(${bgImage})`,
          }}
        >
          CustomHive
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 container mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-[-50px] p-4">
        {features.map((feature, index) => (
          <motion.div
            key={index}
            className="bg-white p-6 rounded-2xl shadow-lg text-center"
          >
            <div className="w-24 h-24 mx-auto bg-gray-200 rounded-full flex items-center justify-center">
              <img
                src={feature.icon}
                alt={feature.title}
                className="w-16 h-16"
              />
            </div>
            <h4 className="text-xl font-semibold mt-4">{feature.title}</h4>
            <p className="text-gray-600 mt-2">{feature.description}</p>
          </motion.div>
        ))}
      </section>

      <section className="flex flex-col items-center py-16 bg-gray-100 min-h-screen">
        <motion.h2
          className="text-3xl font-bold text-center mb-10"
          style={{ marginBottom: "100px" }} // Adjust the margin to create space
        >
          Manage Everything
        </motion.h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-16 px-8 md:px-12 lg:px-16">
          {gifts.map((gift, index) => (
            <motion.div
              key={index}
              className="relative bg-white shadow-lg rounded-2xl overflow-hidden"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.5, delay: index * 0.2 }}
              style={{ height: "450px", width: "250px" }} // Adjust the height and width of each card here
            >
              <img
                src={gift.icon}
                alt={gift.title}
                className="w-full object-cover"
                style={{ height: "250px" }} // Adjust the height of the image here
              />
              <div className="p-6">
                <h4 className="text-xl font-semibold">{gift.title}</h4>
                <p className="text-gray-600 mt-2">{gift.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <section
        className="relative bg-fixed bg-center bg-cover text-white flex flex-col items-center justify-center text-center h-[70vh]"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url(${bgImage})`, // Replace with your image path
        }}
      >
        {/* Overlay for shading effect */}
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>

        {/* Content */}
        <div className="relative z-10 max-w-2xl">
          <motion.h2
            className="text-3xl md:text-2xl font-bold"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.5 }}
          >
            Discover Unique & Personalized Creations!
          </motion.h2>
          <motion.p
            className="mt-4 text-lg md:text-xl text-gray-200"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.5, delay: 0.5 }}
          >
            CustomHive brings your imagination to life with handcrafted gifts
            and personalized creations, made just for you!
          </motion.p>

          <motion.a
            href="#"
            className="mt-6 inline-block bg-transparent border-2 border-white text-white py-2 px-6 rounded-full text-lg hover:bg-white hover:text-black transition-all"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.5, delay: 0.7 }}
          >
            Explore Our Collection
          </motion.a>
        </div>
      </section>

      <section className="flex flex-col items-center justify-center py-16 px-4 md:px-10 lg:px-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-6xl w-full">
          {/* Image Section */}
          <motion.div
            className="rounded-lg overflow-hidden"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1.5, delay: 0.5 }}
          >
            <img
              src={tree}
              alt="Custom Handmade Gifts"
              className="rounded-lg w-full h-auto object-cover"
            />
          </motion.div>

          {/* Text Content */}
          <motion.div
            className="bg-gray-100 rounded-lg p-8 flex flex-col items-center text-center"
            initial={{ opacity: 0, rotateX: 90 }}
            animate={{ opacity: 1, rotateX: 0 }}
            transition={{ duration: 1.5, delay: 0.7 }}
          >
            <h2 className="text-3xl font-bold mb-4">About CustomHive</h2>
            <p className="text-gray-600 mb-6">
              CustomHive is your go-to digital marketplace for personalized and
              handmade creations. We empower small businesses and artisans by
              providing a space to showcase their unique, handcrafted products.
            </p>

            {/* Stats Section */}
            <div className="grid grid-cols-3 gap-4 w-full">
              {[
                { value: "500+", label: "Happy Customers" },
                { value: "200+", label: "Creative Artisans" },
                { value: "1000+", label: "Unique Creations" },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  className="flex flex-col items-center"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, delay: index * 0.3 }}
                >
                  <h3 className="text-4xl font-bold text-blue-600">
                    {item.value}
                  </h3>
                  <h6 className="text-gray-700">{item.label}</h6>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <section className="flex flex-col items-center py-16 px-4 md:flex-row md:px-16">
        {/* Text Content */}
        <div className="w-full md:w-2/3 md:pr-10 animate-fadeInLeft">
          <h3 className="text-3xl font-bold text-left mb-6">
            Discover Personalized & Handmade Gifts
          </h3>
          <div className="space-y-6">
            {[
              {
                title: "Customized Gifts",
                text: "From engraved wooden plaques to personalized jewelry, find gifts that make every occasion special.",
              },
              {
                title: "Handmade Craft Items",
                text: "Support artisans creating beautiful handwoven textiles, ceramics, and unique artwork.",
              },
              {
                title: "Personalized Digital Art",
                text: "Order custom illustrations, portraits, and calligraphy crafted by talented designers.",
              },
              {
                title: "Unique Home Décor",
                text: "Decorate your space with handcrafted home décor items, from custom wall art to scented candles.",
              },
            ].map((item, index) => (
              <div key={index} className="border-l-4 border-blue-500 pl-4">
                <h4 className="text-lg font-semibold">{item.title}</h4>
                <p className="text-gray-600">{item.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Image Section */}
        <div className="w-full md:w-1/3 flex justify-center mt-10 md:mt-0 animate-fadeInRight">
          <img
            src={tree}
            alt="Personalized Handmade Gifts"
            className="rounded-lg shadow-lg w-full max-w-sm"
          />
        </div>
      </section>

      <section className="flex flex-col items-center justify-center py-12 px-6 bg-gray-100">
        <h2 className="text-3xl font-bold text-center mb-8">
          What Our Customers Say
        </h2>
        <div className="flex space-x-6 overflow-x-auto scrollbar-hide">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-xl shadow-md transition-transform transform hover:scale-105 hover:shadow-lg w-80 flex-shrink-0"
            >
              <h5 className="text-xl font-semibold mb-2">{testimonial.name}</h5>
              <p className="text-gray-600 mb-4">{testimonial.text}</p>
              <div className="border-b-2 border-gray-300 w-16 mb-2"></div>
              <h6 className="text-sm text-gray-500">{testimonial.date}</h6>
            </div>
          ))}
        </div>
      </section>

      {/* Contact Section */}
      <section className="flex flex-col lg:flex-row items-center justify-center py-12 px-6 bg-gray-100">
        <div className="lg:w-1/2 space-y-4">
          <h3 className="text-2xl font-bold text-left">
            We’d Love to Hear From You
          </h3>
          <form className="bg-white p-6 rounded-lg shadow-md space-y-4">
            <div>
              <label className="block text-gray-700">Name</label>
              <input
                type="text"
                placeholder="Enter your Name"
                className="w-full p-2 border rounded-md"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700">Email</label>
              <input
                type="email"
                placeholder="Enter a valid email address"
                className="w-full p-2 border rounded-md"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700">Message</label>
              <textarea
                placeholder="Enter your message"
                rows="4"
                className="w-full p-2 border rounded-md"
                required
              ></textarea>
            </div>
            <button
              type="submit"
              className="bg-blue-500 text-white py-2 px-4 rounded-lg"
            >
              Send
            </button>
          </form>
        </div>
        <div className="lg:w-1/2 flex justify-center mt-6 lg:mt-0">
          <img
            src={imgg}
            alt="Customer Support"
            className="rounded-lg w-full max-w-md"
          />
        </div>
      </section>

      <footer className="bg-gray-900 text-white py-6 mt-10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Logo & About */}
            <div>
              <h2 className="text-2xl font-semibold">CustomHive</h2>
              <p className="text-gray-400 mt-2">
                A marketplace for personalized and handmade creations,
                connecting artisans with customers.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-lg font-semibold">Quick Links</h3>
              <ul className="mt-2 space-y-2 text-gray-400">
                <li>
                  <a href="#features" className="hover:text-white">
                    Shop
                  </a>
                </li>
                <li>
                  <a href="#contact" className="hover:text-white">
                    Contact
                  </a>
                </li>
                <li>
                  <a href="#about" className="hover:text-white">
                    About
                  </a>
                </li>
              </ul>
            </div>

            {/* Social Media */}
            <div>
              <h3 className="text-lg font-semibold">Follow Us</h3>
              <div className="flex space-x-4 mt-2">
                <a href="#" className="text-gray-400 hover:text-white text-xl">
                  <FaInstagram />
                </a>
                <a href="#" className="text-gray-400 hover:text-white text-xl">
                  <FaFacebook />
                </a>
                <a href="#" className="text-gray-400 hover:text-white text-xl">
                  <FaLinkedin />
                </a>
                <a href="#" className="text-gray-400 hover:text-white text-xl">
                  <FaTwitter />
                </a>
              </div>
            </div>
          </div>

          <div className="text-center text-gray-400 mt-6 border-t border-gray-700 pt-4">
            <p>
              &copy; {new Date().getFullYear()} CustomHive. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
