#!/bin/bash

# Function to display usage instructions
show_usage() {
    echo "Usage: $0 <command> [options]"
    echo ""
    echo "Commands:"
    echo "  bump <major|minor|patch>  - Bump version number"
    echo "  set <version>            - Set specific version (e.g., 1.2.3)"
    echo "  current                  - Show current version"
    echo "  build                    - Bump build number"
    echo ""
    echo "Examples:"
    echo "  $0 bump patch            - Bump patch version (1.0.0 -> 1.0.1)"
    echo "  $0 bump minor            - Bump minor version (1.0.0 -> 1.1.0)"
    echo "  $0 bump major            - Bump major version (1.0.0 -> 2.0.0)"
    echo "  $0 set 1.2.3            - Set version to 1.2.3"
    echo "  $0 current              - Display current version"
    echo "  $0 build                - Increment build number"
}

# Function to get current version from project.yml
get_current_version() {
    grep "CFBundleShortVersionString:" project.yml | sed 's/.*: //' | tr -d '"'
}

# Function to get current build number from project.yml
get_current_build() {
    grep "CFBundleVersion:" project.yml | sed 's/.*: //' | tr -d '"'
}

# Function to update version in project.yml
update_version() {
    local new_version=$1
    sed -i '' "s/CFBundleShortVersionString: .*/CFBundleShortVersionString: $new_version/" project.yml
    echo "Updated version to $new_version"
}

# Function to update build number in project.yml
update_build() {
    local new_build=$1
    sed -i '' "s/CFBundleVersion: .*/CFBundleVersion: $new_build/" project.yml
    echo "Updated build number to $new_build"
}

# Function to create git tag
create_git_tag() {
    local version=$1
    local build=$2
    git tag -a "v$version-$build" -m "Release version $version build $build"
    echo "Created git tag v$version-$build"
}

# Main script logic
case "$1" in
    "bump")
        current_version=$(get_current_version)
        major=$(echo $current_version | cut -d. -f1)
        minor=$(echo $current_version | cut -d. -f2)
        patch=$(echo $current_version | cut -d. -f3)
        
        case "$2" in
            "major")
                new_version="$((major + 1)).0.0"
                ;;
            "minor")
                new_version="$major.$((minor + 1)).0"
                ;;
            "patch")
                new_version="$major.$minor.$((patch + 1))"
                ;;
            *)
                echo "Error: Invalid bump type. Use major, minor, or patch."
                show_usage
                exit 1
                ;;
        esac
        
        update_version $new_version
        ;;
        
    "set")
        if [[ $2 =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
            update_version $2
        else
            echo "Error: Invalid version format. Use x.y.z (e.g., 1.2.3)"
            show_usage
            exit 1
        fi
        ;;
        
    "current")
        version=$(get_current_version)
        build=$(get_current_build)
        echo "Current version: $version (build $build)"
        ;;
        
    "build")
        current_build=$(get_current_build)
        new_build=$((current_build + 1))
        update_build $new_build
        
        # Create git tag with current version and new build
        version=$(get_current_version)
        create_git_tag $version $new_build
        ;;
        
    *)
        show_usage
        exit 1
        ;;
esac

exit 0 