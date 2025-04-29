# NeuroNest

NeuroNest is an iPad application designed to support neurodivergent children with emotional regulation and sensory processing. The app provides a safe, engaging space for children to explore their emotions and develop coping strategies.

## Features

- **Child Mode**: Interactive activities and tools designed for neurodivergent children
  - Calm Down Zone
  - Mission Control
  - Sensory Explorer
  - Talk Time
  - Bravery Challenge

- **Carer Mode**: Settings and progress tracking for parents and caregivers

## Development Setup

### Prerequisites

- Xcode 14.0 or later
- iOS 16.0+ deployment target
- iPad target device
- [Homebrew](https://brew.sh) package manager
- [XcodeGen](https://github.com/yonaskolb/XcodeGen)
- [SwiftLint](https://github.com/realm/SwiftLint)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/NeuroNest.git
   cd NeuroNest
   ```

2. Run the setup script:
   ```bash
   ./scripts/setup.sh
   ```

3. Open the generated Xcode project:
   ```bash
   open NeuroNest.xcodeproj
   ```

### Development Workflow

1. Create a new branch for your feature:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes and commit them:
   ```bash
   git add .
   git commit -m "Description of your changes"
   ```

3. Push your changes and create a pull request:
   ```bash
   git push origin feature/your-feature-name
   ```

### Version Management

Use the version management script for consistent versioning:

```bash
# Show current version
./scripts/version_manager.sh current

# Bump version (patch|minor|major)
./scripts/version_manager.sh bump patch

# Set specific version
./scripts/version_manager.sh set 1.2.3
```

## Project Structure

```
NeuroNest/
├── Sources/
│   ├── App/            # App entry point and configuration
│   ├── Views/          # SwiftUI views
│   │   ├── Common/     # Shared components
│   │   ├── Child/      # Child mode views
│   │   ├── Carer/      # Carer mode views
│   │   └── Onboarding/ # Onboarding flow
│   ├── ViewModels/     # View models and business logic
│   ├── Models/         # Data models
│   ├── Utils/          # Utility functions and extensions
│   └── Resources/      # Assets and resources
├── Tests/              # Unit and UI tests
└── scripts/            # Development and deployment scripts
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

[Your License Here]

## Contact

[Your Contact Information]
