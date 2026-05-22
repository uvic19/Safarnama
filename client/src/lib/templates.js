export const TEMPLATES = [
  {
    id: 't1',
    name: 'Goa Weekend Getaway',
    destinations: ['Goa'],
    duration_days: 3,
    estimated_budget: 15000,
    tags: ['Beach', 'Party', 'Relax'],
    itinerary: [
      { day_offset: 0, place_name: 'Arrive in Goa & Check-in', stop_type: 'TRANSIT', lat: 15.3999, lng: 73.8122, notes: 'Land at Dabolim Airport, head to North Goa.' },
      { day_offset: 0, place_name: 'Baga Beach', stop_type: 'TOURIST', lat: 15.5553, lng: 73.7517, notes: 'Relax by the beach shacks, catch the sunset.' },
      { day_offset: 0, place_name: 'Tito\'s Lane', stop_type: 'ACTIVITY', lat: 15.5539, lng: 73.7523, notes: 'Dinner and party.' },
      { day_offset: 1, place_name: 'Aguada Fort', stop_type: 'TOURIST', lat: 15.4920, lng: 73.7735, notes: 'Morning visit to the historic Portuguese fort.' },
      { day_offset: 1, place_name: 'Anjuna Flea Market', stop_type: 'TOURIST', lat: 15.5733, lng: 73.7402, notes: 'Shopping and lunch. Opens on Wednesdays.' },
      { day_offset: 1, place_name: 'Vagator Beach', stop_type: 'TOURIST', lat: 15.5947, lng: 73.7329, notes: 'Sunset views from the cliffs.' },
      { day_offset: 2, place_name: 'Basilica of Bom Jesus', stop_type: 'TOURIST', lat: 15.5009, lng: 73.9116, notes: 'Explore Old Goa heritage.' },
      { day_offset: 2, place_name: 'Departure', stop_type: 'TRANSIT', lat: 15.3999, lng: 73.8122, notes: 'Head back to the airport.' },
    ]
  },
  {
    id: 't2',
    name: 'Manali Backpacking',
    destinations: ['Manali', 'Kasol'],
    duration_days: 5,
    estimated_budget: 8000,
    tags: ['Mountains', 'Adventure', 'Budget'],
    itinerary: [
      { day_offset: 0, place_name: 'Arrive in Manali', stop_type: 'TRANSIT', lat: 32.2396, lng: 77.1887, notes: 'Reach Manali bus stand and check into hostel.' },
      { day_offset: 0, place_name: 'Mall Road', stop_type: 'FOOD', lat: 32.2426, lng: 77.1895, notes: 'Evening walk and local street food.' },
      { day_offset: 1, place_name: 'Solang Valley', stop_type: 'ACTIVITY', lat: 32.3166, lng: 77.1583, notes: 'Paragliding, ATVs, and snow activities.' },
      { day_offset: 2, place_name: 'Rohtang Pass', stop_type: 'TOURIST', lat: 32.3716, lng: 77.2466, notes: 'Day trip to Rohtang (Requires early start and permit).' },
      { day_offset: 3, place_name: 'Travel to Kasol', stop_type: 'TRANSIT', lat: 32.0098, lng: 77.3149, notes: 'Local bus from Kullu to Kasol.' },
      { day_offset: 3, place_name: 'Chalal Trek', stop_type: 'ACTIVITY', lat: 32.0138, lng: 77.3113, notes: 'Short trek along the Parvati River.' },
      { day_offset: 4, place_name: 'Manikaran Sahib', stop_type: 'TOURIST', lat: 32.0270, lng: 77.3456, notes: 'Visit the Gurudwara and hot springs before departing.' },
    ]
  },
  {
    id: 't3',
    name: 'Rajasthan Heritage',
    destinations: ['Jaipur', 'Udaipur', 'Jodhpur'],
    duration_days: 7,
    estimated_budget: 35000,
    tags: ['Culture', 'History', 'Luxury'],
    itinerary: [
      { day_offset: 0, place_name: 'Jaipur City Palace', stop_type: 'TOURIST', lat: 26.9255, lng: 75.8236, notes: 'Arrive in Jaipur and explore the royal palace.' },
      { day_offset: 0, place_name: 'Hawa Mahal', stop_type: 'TOURIST', lat: 26.9239, lng: 75.8267, notes: 'Palace of Winds. Great for photography.' },
      { day_offset: 1, place_name: 'Amer Fort', stop_type: 'TOURIST', lat: 26.9855, lng: 75.8513, notes: 'Morning elephant ride or walk up to the fort.' },
      { day_offset: 1, place_name: 'Chokhi Dhani', stop_type: 'FOOD', lat: 26.7675, lng: 75.8016, notes: 'Traditional Rajasthani dinner and cultural village.' },
      { day_offset: 2, place_name: 'Travel to Jodhpur', stop_type: 'TRANSIT', lat: 26.2389, lng: 73.0243, notes: 'Morning train/drive to the Blue City.' },
      { day_offset: 2, place_name: 'Mehrangarh Fort', stop_type: 'TOURIST', lat: 26.2978, lng: 73.0185, notes: 'Sunset views over the Blue City.' },
      { day_offset: 3, place_name: 'Travel to Udaipur', stop_type: 'TRANSIT', lat: 24.5854, lng: 73.7125, notes: 'Drive via Ranakpur Jain Temple.' },
      { day_offset: 4, place_name: 'Lake Pichola Boat Ride', stop_type: 'ACTIVITY', lat: 24.5707, lng: 73.6769, notes: 'Evening boat ride around Jag Mandir.' },
      { day_offset: 5, place_name: 'City Palace Udaipur', stop_type: 'TOURIST', lat: 24.5764, lng: 73.6835, notes: 'Largest palace complex in Rajasthan.' },
      { day_offset: 6, place_name: 'Departure', stop_type: 'TRANSIT', notes: 'Fly out from Maharana Pratap Airport.' },
    ]
  }
];
