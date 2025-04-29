#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Setting up NeuroNest development environment...${NC}"

# Check for Xcode
if ! xcode-select -p &> /dev/null; then
    echo -e "${RED}Error: Xcode not found${NC}"
    echo "Please install Xcode from the App Store"
    exit 1
fi

# Check for Homebrew
if ! command -v brew &> /dev/null; then
    echo -e "${YELLOW}Installing Homebrew...${NC}"
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
fi

# Install XcodeGen
if ! command -v xcodegen &> /dev/null; then
    echo -e "${YELLOW}Installing XcodeGen...${NC}"
    brew install xcodegen
fi

# Install SwiftLint
if ! command -v swiftlint &> /dev/null; then
    echo -e "${YELLOW}Installing SwiftLint...${NC}"
    brew install swiftlint
fi

# Generate Xcode project
echo -e "${YELLOW}Generating Xcode project...${NC}"
xcodegen generate

# Setup git hooks
if [ -d ".git" ]; then
    echo -e "${YELLOW}Setting up git hooks...${NC}"
    mkdir -p .git/hooks
    # Create pre-commit hook for SwiftLint
    cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash
SWIFT_LINT=`which swiftlint`

if [[ -e "${SWIFT_LINT}" ]]; then
    echo "Running SwiftLint..."
    RESULT=$($SWIFT_LINT lint --quiet)
    if [ "$RESULT" == "" ]; then
        echo "SwiftLint passed"
        exit 0
    else
        echo "SwiftLint failed:"
        echo "$RESULT"
        exit 1
    fi
else
    echo "SwiftLint not installed"
    exit 1
fi
EOF
    
    chmod +x .git/hooks/pre-commit
fi

echo -e "${GREEN}Setup complete!${NC}"
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Open NeuroNest.xcodeproj"
echo "2. Build and run the project (⌘R)"
echo "3. Run the tests (⌘U)" 