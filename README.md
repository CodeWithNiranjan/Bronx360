# Bronx360

## Inspiration
Bronx360 was inspired by the need to create a more connected and responsive community in the Bronx. We wanted to build a platform that would make it easier for residents to report local issues and for administrators to track and address these concerns efficiently. The project aims to bridge the gap between community members and local administration, fostering a more engaged and proactive neighborhood.

## What it does
Bronx360 is a full-stack web application that enables:

- **Community Reporting**: Residents can submit reports about local issues (e.g., potholes, street lights, sanitation) with precise location data
- **Real-time Tracking**: Users can view the status of reported issues on an interactive map
- **Admin Dashboard**: Administrators can manage and update the status of reports
- **Responsive Design**: The application works seamlessly across desktop and mobile devices
- **Secure Authentication**: Protected admin access with JWT-based authentication

## How we built it
The project is built using modern web technologies:

### Frontend
- HTML5, CSS3, and JavaScript for the user interface
- Bootstrap 5 for responsive design and modern UI components
- Leaflet.js for interactive maps
- Space Grotesk font for modern typography
- Bootstrap Icons for intuitive visual elements

### Backend
- Node.js with Express.js for the server
- SQLite3 for the database
- JWT for secure authentication
- bcrypt for password hashing
- CORS for secure cross-origin requests

### Key Features
- Interactive map integration for precise location reporting
- Real-time status updates
- Secure admin authentication
- Responsive design for all devices
- Modern, minimalist UI with intuitive navigation

## Challenges we ran into
- **Map Integration**: Implementing precise location selection and validation
- **Real-time Updates**: Ensuring consistent state management across the application
- **Security**: Implementing secure authentication and protecting sensitive routes
- **Database Design**: Creating an efficient schema for report management
- **UI/UX**: Balancing functionality with a clean, modern design
- **Cross-browser Compatibility**: Ensuring consistent experience across different browsers

## Accomplishments that we're proud of
- Created a user-friendly interface that makes community reporting accessible
- Implemented secure authentication system for admin access
- Built a responsive design that works well on all devices
- Developed an efficient database structure for report management
- Created a modern, minimalist UI that enhances user experience
- Successfully integrated mapping functionality for precise location reporting

## What we learned
- Advanced frontend development with modern CSS and JavaScript
- Backend development with Node.js and Express
- Database design and management with SQLite
- Security best practices for web applications
- Map integration and geolocation services
- State management and real-time updates
- Responsive design principles
- User experience optimization

## What's next for Bronx360
- **User Accounts**: Allow residents to create accounts and track their reports
- **Push Notifications**: Implement real-time notifications for report updates
- **Mobile App**: Develop native mobile applications for iOS and Android
- **Analytics Dashboard**: Add data visualization for report trends and patterns
- **Community Features**: Add forums and discussion boards for community engagement
- **Multi-language Support**: Implement support for multiple languages
- **Report Categories**: Expand the types of issues that can be reported
- **Integration with City Services**: Connect with existing city service platforms
- **AI-powered Analysis**: Implement machine learning for report categorization
- **Enhanced Admin Tools**: Add more sophisticated reporting and management features

## Getting Started
1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up the database:
   ```bash
   node backend/server.js
   ```
4. Start the server:
   ```bash
   npm start
   ```
5. Access the application at `http://localhost:3000`

## Contributing
We welcome contributions! Please feel free to submit a Pull Request.

## License
This project is licensed under the MIT License - see the LICENSE file for details. 