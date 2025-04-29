# Neuro iOS iPad App Project

## Background and Motivation
- iOS iPad app called "NeuroNest" for neurodivergent children (Ages 5-12)
- Focused on providing home-based support for children with ASD Level 1, ADHD, and anxiety
- Aims to help with emotional regulation, executive functioning, social communication, and anxiety management
- 30-minute daily usage cap to prevent overstimulation

## Key Challenges and Analysis
- Need to create a sensory-safe, structured UI that's not overstimulating
- Must support both child and carer modes with different interfaces
- Requires offline capability and strict privacy considerations
- Complex feature set needs to be presented in a simple, child-friendly way
- Time management and session control are critical features

## Technical Specifications
### Project Structure
```
NeuroNest/
├── App/
│   ├── NeuroNestApp.swift
│   └── AppDelegate.swift
├── Models/
│   ├── UserModel.swift
│   ├── ActivityModel.swift
│   └── ProgressModel.swift
├── Views/
│   ├── Common/
│   │   ├── NeuroButton.swift
│   │   ├── EmojiButton.swift
│   │   ├── ActivityCard.swift
│   │   └── ProgressBar.swift
│   ├── Onboarding/
│   │   ├── LaunchScreen.swift
│   │   └── UserChoiceScreen.swift
│   ├── Child/
│   │   ├── WelcomeChildScreen.swift
│   │   ├── FeelingsCheckInScreen.swift
│   │   ├── AdventureMenuScreen.swift
│   │   ├── CalmDownScreen.swift
│   │   ├── MissionControlScreen.swift
│   │   ├── SessionWrapScreen.swift
│   │   ├── VictoryLapScreen.swift
│   │   ├── SessionCelebrationScreen.swift
│   │   └── HandoverScreen.swift
│   └── Carer/
│       ├── CarerHomeScreen.swift
│       └── SettingsScreen.swift
├── ViewModels/
│   ├── ChildViewModel.swift
│   └── CarerViewModel.swift
├── Utils/
│   ├── Constants.swift
│   ├── ColorExtensions.swift
│   └── ViewExtensions.swift
└── Resources/
    ├── Assets.xcassets
    └── Fonts/
        └── Quicksand/
```

### Design System
- Colors: Defined in Constants.swift with specific hex values
- Typography: Quicksand font family (Regular, Medium, SemiBold, Bold)
- Components: Custom NeuroButton, EmojiButton, ActivityCard
- Animations: Gentle, non-jarring for neurodivergent users
- Navigation: SwiftUI NavigationStack

### Core Features Implementation
1. User Management
   - Child and Carer profiles
   - Focus areas tracking
   - Achievement system
   - Mood tracking

2. Activity System
   - Calm Down Zone
   - Mission Control
   - Sensory Explorer
   - Talk Time
   - Bravery Challenge
   - Custom Activities

3. Session Management
   - 30-minute time cap
   - Progress tracking
   - Celebration system
   - Parent handover

## High-level Task Breakdown
1. Initial Project Setup
   - [x] Define project structure
   - [ ] Create new Xcode project with SwiftUI
   - [ ] Set up basic project structure and architecture
   - [ ] Configure git repository
   - [ ] Add Quicksand font family

2. Core Infrastructure (Week 1)
   - [ ] Implement Constants and Extensions
   - [ ] Create base UI components
   - [ ] Set up ViewModels
   - [ ] Implement navigation system

3. User Mode Implementation (Week 2)
   - [ ] Create Child Mode screens
   - [ ] Create Carer Mode screens
   - [ ] Implement mode switching
   - [ ] Set up session management

4. Feature Implementation (Week 3)
   - [ ] Implement Feelings Check-In
   - [ ] Create activity screens
   - [ ] Add timer and session management
   - [ ] Implement reward system

5. Polish and Testing (Week 4)
   - [ ] Add animations and transitions
   - [ ] Implement sound system
   - [ ] Conduct accessibility testing
   - [ ] Prepare for TestFlight

## Project Status Board
- [x] Project structure defined
- [x] Design system specified
- [x] Core components designed
- [ ] Initial project setup pending
- [ ] Implementation not started

## Current Status / Progress Tracking
Ready to begin initial project setup with complete technical specifications

## Executor's Feedback or Assistance Requests
Ready to proceed with:
1. Creating new Xcode project ✅
2. Setting up project structure ✅
3. Implementing core files (Constants.swift, ColorExtensions.swift) ✅
4. Need assistance with:
   - Downloading and adding the Quicksand font family (Regular, Medium, SemiBold, Bold)
   - Please provide the font files and I will help integrate them into the project

## Lessons
- Project requires careful attention to sensory considerations in UI/UX
- 30-minute daily limit is a hard requirement
- Must support offline functionality
- Privacy and data storage must be local-first
- Use gentle animations and transitions
- Consistent color scheme and typography crucial for user experience

# NeuroNest Development Log

## Project Setup Progress

### Initial Setup (April 29, 2024)

#### Completed Tasks
1. ✅ Created basic project structure
   - Sources/ directory for main app code
   - Tests/ directory for test files
   - scripts/ directory for development tools

2. ✅ Set up development tools
   - Created version management script (version_manager.sh)
   - Created development environment setup script (setup.sh)
   - Added SwiftLint configuration

3. ✅ Created project configuration
   - project.yml for XcodeGen
   - Info.plist with basic app configuration
   - Added Quicksand font configuration

4. ✅ Set up documentation
   - Created comprehensive README.md
   - Added .gitignore for iOS development
   - Created development log (this file)

#### In Progress
1. 🟡 Development environment setup
   - Waiting for Xcode installation to complete
   - Homebrew installed
   - XcodeGen installed
   - SwiftLint installation pending (requires Xcode)

2. 🟡 CI/CD Setup
   - GitHub Actions workflows created
   - Waiting for Apple Developer account activation
   - Need to configure deployment certificates and profiles

#### Next Steps
1. 📋 Complete development environment setup
   - Install Xcode
   - Install SwiftLint
   - Generate Xcode project using XcodeGen
   - Set up git hooks

2. 📋 Configure deployment
   - Set up Apple Developer account
   - Create certificates and provisioning profiles
   - Configure GitHub secrets
   - Test deployment pipeline

3. 📋 Initial development tasks
   - Create basic app architecture
   - Set up SwiftUI views structure
   - Implement design system
   - Set up unit testing framework

## Key Decisions and Notes

### Architecture
- Using SwiftUI for modern UI development
- MVVM architecture pattern
- Targeting iPad only (landscape orientation)
- iOS 16.0+ deployment target

### Development Workflow
- Using GitHub Flow for branching strategy
- SwiftLint for code quality
- XcodeGen for project management
- Automated versioning with version_manager.sh

### Design System
- Using Quicksand font family
- Need to implement design tokens from Canva designs
- iPad-specific UI components

## Lessons Learned
1. Ensure Xcode is installed before running setup script
2. XcodeGen requires proper YAML formatting in project.yml
3. Apple Developer account activation can take 24-48 hours

## Current Status / Progress Tracking
- [x] Basic project structure
- [x] Development tools setup
- [x] Documentation
- [ ] Development environment
- [ ] CI/CD pipeline
- [ ] Initial app architecture

## Executor's Feedback or Assistance Requests
1. Need Apple Developer account activation to proceed with deployment setup
2. Will need design specifications from Canva for UI implementation
3. Waiting for Xcode installation to complete setup process 