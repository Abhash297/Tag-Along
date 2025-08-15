# Tag-Along App

A React Native social app built with Expo for connecting people through shared interests and hangouts.

## Features

- **Discover**: Browse profiles and find people with similar interests
- **Create**: Post hangouts and manage your events
- **Matches**: View and manage your tag-along requests
- **Profile**: View detailed profiles with multiple photos
- **Chat**: Message your matches
- **Theme Support**: Dark and light blue themes with easy switching

## Screenshots

*Add screenshots of your app here*

## Prerequisites

Before running this project, make sure you have:

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Expo CLI** (`npm install -g @expo/cli`)
- **iOS Simulator** (for iOS development) or **Android Studio** (for Android development)

## Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd tagalong-classic
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

## Running the App

### Web Development
```bash
npm run web
```
Opens the app in your web browser for development and testing.

### iOS Development
```bash
npm run ios
```
Opens the app in iOS Simulator (requires Xcode on macOS).

### Android Development
```bash
npm run android
```
Opens the app in Android Emulator (requires Android Studio).

## Project Structure

```
tagalong-classic/
├── App.tsx              # Main application component
├── assets/              # Images, fonts, and other static assets
├── package.json         # Dependencies and scripts
├── tsconfig.json        # TypeScript configuration
├── app.json            # Expo configuration
└── .gitignore          # Git ignore rules
```

## Key Components

- **App.tsx**: Main app with navigation, theme switching, and all screens
- **Discover Screen**: Profile browsing with detailed view modals
- **Create Screen**: Hangout creation and management
- **Matches Screen**: Request management with accept/decline functionality
- **Profile Screen**: User profile management

## Dependencies

### Core Dependencies
- **Expo**: ~53.0.20
- **React**: 19.0.0
- **React Native**: 0.79.5
- **React Native Web**: ^0.20.0

### Development Dependencies
- **TypeScript**: ~5.8.3
- **@types/react**: ~19.0.10
- **@types/react-native**: ^0.73.0

## Configuration

### Expo Configuration (app.json)
The app is configured for iOS, Android, and Web platforms with proper permissions and settings.

### TypeScript Configuration (tsconfig.json)
Configured for React Native development with proper JSX support.

## Development

### Adding New Features
1. Modify the appropriate section in `App.tsx`
2. Update the theme system if adding new UI elements
3. Test on multiple platforms (iOS, Android, Web)

### Theme System
The app uses a custom theme system with:
- **Dark Theme**: Default dark colors
- **Light Theme**: Light blue surface with consistent styling

### State Management
Uses React hooks (`useState`) for local state management across different screens.

## Troubleshooting

### Common Issues

1. **Metro bundler issues**
   ```bash
   npm start --reset-cache
   ```

2. **iOS Simulator not opening**
   - Make sure Xcode is properly installed
   - Check that iOS Simulator is available

3. **Android Emulator issues**
   - Ensure Android Studio and SDK are properly configured
   - Check that an Android Virtual Device (AVD) is created

4. **Port conflicts**
   - If port 8081 is in use, Expo will automatically try other ports
   - Check terminal output for the correct port

### Getting Help
- Check the [Expo documentation](https://docs.expo.dev/)
- Review [React Native documentation](https://reactnative.dev/)
- Check the [Expo GitHub issues](https://github.com/expo/expo/issues)

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contact

*Add your contact information here*

---

**Note**: This is a React Native app built with Expo. Make sure you have the proper development environment set up before running the project.
