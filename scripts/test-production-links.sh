#!/bin/bash

# Test all navigation links against production
# Base URL for production
BASE_URL="https://prelaunch.bearlakecamp.com"

echo "Testing all navigation links against production..."
echo "Base URL: $BASE_URL"
echo ""
echo "Link,Status Code,Result"

# Function to test a link
test_link() {
  local path=$1
  local url="${BASE_URL}${path}"
  local status=$(curl -s -o /dev/null -w "%{http_code}" -L "$url")

  if [ "$status" = "200" ]; then
    echo "${path},${status},✅ OK"
  elif [ "$status" = "404" ]; then
    echo "${path},${status},❌ NOT FOUND"
  else
    echo "${path},${status},⚠️ OTHER"
  fi
}

# Homepage
test_link "/"

# Summer Camp
test_link "/summer-camp"
test_link "/summer-camp-sessions"
test_link "/summer-camp-what-to-bring"
test_link "/summer-camp-faq"

# Work at Camp
test_link "/work-at-camp"
test_link "/work-at-camp-summer-staff"
test_link "/work-at-camp-year-round"
test_link "/work-at-camp-leaders-in-training"

# Retreats
test_link "/retreats"
test_link "/retreats-defrost"
test_link "/retreats-recharge"

# Facilities
test_link "/facilities"
test_link "/facilities-cabins"
test_link "/facilities-chapel"
test_link "/facilities-dining-hall"
test_link "/facilities-rec-center"
test_link "/facilities-outdoor"

# Give
test_link "/give"

# About
test_link "/about"
test_link "/about-our-team"

echo ""
echo "Testing complete!"
