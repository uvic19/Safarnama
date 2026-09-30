export const TEMPLATES = [
  {
    id: 't1',
    name: 'Goa Weekend Getaway',
    destinations: ['Goa'],
    duration_days: 3,
    estimated_budget: 15000,
    tags: ['Beach', 'Party', 'Relax'],
    itinerary: [
      { day_offset: 0, place_name: 'Arrive & Rent Scooter', stop_type: 'TRANSIT', lat: 15.3999, lng: 73.8122, notes: 'Land at Dabolim/Mopa, rent a scooter and head to Vagator/Anjuna.' },
      { day_offset: 0, place_name: 'Chapora Fort Sunset', stop_type: 'TOURIST', lat: 15.6057, lng: 73.7371, notes: 'Iconic sunset views over the Arabian Sea.' },
      { day_offset: 0, place_name: 'Dinner at Thalassa', stop_type: 'FOOD', lat: 15.6174, lng: 73.7431, notes: 'Greek food with amazing vibes in Siolim.' },
      { day_offset: 1, place_name: 'Fontainhas Heritage Walk', stop_type: 'ACTIVITY', lat: 15.4989, lng: 73.8282, notes: 'Explore the colorful Latin Quarter of Panjim.' },
      { day_offset: 1, place_name: 'Mandovi River Cruise', stop_type: 'TOURIST', lat: 15.5029, lng: 73.8267, notes: 'Evening sunset cruise or visit an offshore Casino.' },
      { day_offset: 2, place_name: 'Morjim / Ashwem Beach', stop_type: 'ACTIVITY', lat: 15.6231, lng: 73.7340, notes: 'Quiet, clean beaches for a relaxed morning swim.' },
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
      { day_offset: 0, place_name: 'Settle in Old Manali', stop_type: 'HOTEL', lat: 32.2533, lng: 77.1812, notes: 'Avoid the main town, stay in Old Manali for the best backpacker cafes.' },
      { day_offset: 0, place_name: 'Hadimba Devi Temple', stop_type: 'TOURIST', lat: 32.2475, lng: 77.1817, notes: 'Ancient cave temple surrounded by cedar forests.' },
      { day_offset: 1, place_name: 'Atal Tunnel to Sissu', stop_type: 'ACTIVITY', lat: 32.4746, lng: 77.1278, notes: 'Drive through the engineering marvel to see the dramatic landscape change in Lahaul.' },
      { day_offset: 1, place_name: 'Solang Valley', stop_type: 'ACTIVITY', lat: 32.3166, lng: 77.1583, notes: 'Stop on the way back for paragliding or ATVs.' },
      { day_offset: 2, place_name: 'Naggar Castle', stop_type: 'TOURIST', lat: 32.1167, lng: 77.1667, notes: 'Explore this hidden gem made of wood and stone with stunning valley views.' },
      { day_offset: 3, place_name: 'Kasol & Manikaran Day Trip', stop_type: 'TRANSIT', lat: 32.0098, lng: 77.3149, notes: 'Drive to Parvati Valley. Visit the Gurudwara and natural hot springs.' },
      { day_offset: 4, place_name: 'Mall Road Shopping & Departure', stop_type: 'FOOD', lat: 32.2426, lng: 77.1895, notes: 'Pick up souvenirs and take the overnight Volvo back.' },
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
      { day_offset: 0, place_name: 'Jaipur: Amer Fort', stop_type: 'TOURIST', lat: 26.9855, lng: 75.8513, notes: 'Start early. Classic Rajput architecture and Maota Lake views.' },
      { day_offset: 0, place_name: 'Jhalana Leopard Safari', stop_type: 'ACTIVITY', lat: 26.8524, lng: 75.8197, notes: 'Evening safari for wildlife right in the city.' },
      { day_offset: 1, place_name: 'Hawa Mahal & LMB', stop_type: 'FOOD', lat: 26.9239, lng: 75.8267, notes: 'Palace of Winds photo op, then authentic Rajasthani food at Laxmi Misthan Bhandar.' },
      { day_offset: 2, place_name: 'Drive to Jodhpur', stop_type: 'TRANSIT', lat: 26.2389, lng: 73.0243, notes: 'Morning drive to the Blue City.' },
      { day_offset: 2, place_name: 'Mehrangarh Fort', stop_type: 'TOURIST', lat: 26.2978, lng: 73.0185, notes: 'One of the largest and best-maintained forts in India.' },
      { day_offset: 3, place_name: 'Drive to Jaisalmer', stop_type: 'TRANSIT', lat: 26.9157, lng: 70.9083, notes: 'Journey into the Thar Desert.' },
      { day_offset: 3, place_name: 'Sam Sand Dunes Camp', stop_type: 'HOTEL', lat: 26.8277, lng: 70.5113, notes: 'Overnight desert safari, camel ride, and stargazing.' },
      { day_offset: 4, place_name: 'Jaisalmer Golden Fort', stop_type: 'TOURIST', lat: 26.9124, lng: 70.9125, notes: 'Explore India\'s only living fort and Patwon ki Haveli.' },
      { day_offset: 5, place_name: 'Travel to Udaipur', stop_type: 'TRANSIT', lat: 24.5854, lng: 73.7125, notes: 'Long drive down to the City of Lakes.' },
      { day_offset: 6, place_name: 'City Palace & Lake Pichola', stop_type: 'ACTIVITY', lat: 24.5764, lng: 73.6835, notes: 'Palace tour followed by an evening boat ride around Jag Mandir.' },
    ]
  },
  {
    id: 't4',
    name: 'Valley of Flowers Trek',
    destinations: ['Rishikesh', 'Ghangaria', 'Hemkund Sahib'],
    duration_days: 6,
    estimated_budget: 12000,
    tags: ['Trekking', 'Nature', 'Himalayas'],
    itinerary: [
      { day_offset: 0, place_name: 'Arrival in Rishikesh', stop_type: 'TRANSIT', lat: 30.0869, lng: 78.2676, notes: 'Reach Rishikesh, prep for the journey.' },
      { day_offset: 1, place_name: 'Drive to Govindghat', stop_type: 'TRANSIT', lat: 30.6231, lng: 79.5532, notes: 'Long drive (~10 hrs) from Rishikesh to the base.' },
      { day_offset: 2, place_name: 'Trek to Ghangaria', stop_type: 'ACTIVITY', lat: 30.6953, lng: 79.5891, notes: '10km trek from Pulna to Ghangaria base camp.' },
      { day_offset: 3, place_name: 'Valley of Flowers', stop_type: 'TOURIST', lat: 30.7280, lng: 79.6053, notes: 'Full day exploring the UNESCO World Heritage floral valley.' },
      { day_offset: 4, place_name: 'Hemkund Sahib', stop_type: 'ACTIVITY', lat: 30.6997, lng: 79.6156, notes: 'Steep climb to the high-altitude Gurudwara and glacial lake.' },
      { day_offset: 5, place_name: 'Return Journey', stop_type: 'TRANSIT', lat: 30.0869, lng: 78.2676, notes: 'Descend to Govindghat and drive back to Rishikesh.' }
    ]
  },
  {
    id: 't5',
    name: 'Spiti Valley Roadtrip',
    destinations: ['Shimla', 'Kaza', 'Chandratal'],
    duration_days: 8,
    estimated_budget: 25000,
    tags: ['Road Trip', 'Mountains', 'Adventure'],
    itinerary: [
      { day_offset: 0, place_name: 'Shimla to Kalpa', stop_type: 'TRANSIT', lat: 31.5361, lng: 78.2562, notes: 'Begin the circuit, stunning views of Kinnaur Kailash.' },
      { day_offset: 1, place_name: 'Nako & Tabo', stop_type: 'TOURIST', lat: 32.0833, lng: 78.3833, notes: 'Visit Nako lake and the 1000-year old Tabo Monastery.' },
      { day_offset: 2, place_name: 'Kaza', stop_type: 'TRANSIT', lat: 32.2276, lng: 78.0709, notes: 'Arrive in the heart of Spiti Valley.' },
      { day_offset: 3, place_name: 'Key Monastery & Kibber', stop_type: 'TOURIST', lat: 32.2981, lng: 78.0122, notes: 'Explore iconic Key Gompa and high-altitude villages.' },
      { day_offset: 4, place_name: 'Hikkim & Komic', stop_type: 'ACTIVITY', lat: 32.2407, lng: 78.0315, notes: 'Send a postcard from the world\'s highest post office.' },
      { day_offset: 5, place_name: 'Chandratal Lake', stop_type: 'TOURIST', lat: 32.4824, lng: 77.6157, notes: 'Camp near the crescent-shaped moon lake.' },
      { day_offset: 6, place_name: 'Kunzum & Rohtang', stop_type: 'TRANSIT', lat: 32.3716, lng: 77.2466, notes: 'Cross treacherous passes to reach Manali.' },
      { day_offset: 7, place_name: 'Manali Departure', stop_type: 'TRANSIT', lat: 32.2396, lng: 77.1887, notes: 'End of the epic road trip.' }
    ]
  },
  {
    id: 't6',
    name: 'Kerala Backwaters & Tea',
    destinations: ['Munnar', 'Alleppey', 'Kochi'],
    duration_days: 5,
    estimated_budget: 20000,
    tags: ['Relax', 'Nature', 'Couples'],
    itinerary: [
      { day_offset: 0, place_name: 'Arrive in Kochi', stop_type: 'TRANSIT', lat: 9.9312, lng: 76.2673, notes: 'Land in Kochi, drive to Munnar.' },
      { day_offset: 1, place_name: 'Munnar Tea Gardens', stop_type: 'TOURIST', lat: 10.0892, lng: 77.0595, notes: 'Visit tea museums and stroll through estates.' },
      { day_offset: 2, place_name: 'Eravikulam National Park', stop_type: 'ACTIVITY', lat: 10.2119, lng: 77.0672, notes: 'Spot the endangered Nilgiri Tahr.' },
      { day_offset: 3, place_name: 'Alleppey Houseboat', stop_type: 'HOTEL', lat: 9.4981, lng: 76.3388, notes: 'Overnight stay cruising the tranquil backwaters.' },
      { day_offset: 4, place_name: 'Fort Kochi', stop_type: 'TOURIST', lat: 9.9658, lng: 76.2421, notes: 'See Chinese fishing nets and colonial heritage before departing.' }
    ]
  },
  {
    id: 't7',
    name: 'Bali Tropical Escape',
    destinations: ['Ubud', 'Uluwatu'],
    duration_days: 7,
    estimated_budget: 65000,
    tags: ['International', 'Beach', 'Culture'],
    itinerary: [
      { day_offset: 0, place_name: 'Arrival in Bali', stop_type: 'TRANSIT', lat: -8.7482, lng: 115.1675, notes: 'Land at DPS, head to Ubud.' },
      { day_offset: 1, place_name: 'Campuhan Ridge & Tirta Empul', stop_type: 'ACTIVITY', lat: -8.4147, lng: 115.3121, notes: 'Early morning walk, followed by water temple cleansing.' },
      { day_offset: 2, place_name: 'Tegalalang Rice Terraces', stop_type: 'TOURIST', lat: -8.4336, lng: 115.2796, notes: 'Explore the iconic terraces (go early to avoid crowds).' },
      { day_offset: 3, place_name: 'Mount Batur Cafe / Kintamani', stop_type: 'FOOD', lat: -8.2435, lng: 115.3780, notes: 'Coffee with a view of the volcano.' },
      { day_offset: 4, place_name: 'Transfer to Uluwatu', stop_type: 'TRANSIT', lat: -8.8291, lng: 115.0886, notes: 'Move south for beaches and cliffs.' },
      { day_offset: 5, place_name: 'Uluwatu Temple & Kecak Dance', stop_type: 'TOURIST', lat: -8.8291, lng: 115.0886, notes: 'Cliffside sunset views and traditional fire dance.' },
      { day_offset: 6, place_name: 'Beach Club Relaxing', stop_type: 'ACTIVITY', lat: -8.8202, lng: 115.1189, notes: 'Chill at Savaya or Sunday\'s Beach Club before late flight.' }
    ]
  },
  {
    id: 't8',
    name: 'Japan Golden Route',
    destinations: ['Tokyo', 'Kyoto', 'Osaka'],
    duration_days: 8,
    estimated_budget: 150000,
    tags: ['International', 'City', 'Food'],
    itinerary: [
      { day_offset: 0, place_name: 'Tokyo Arrival', stop_type: 'TRANSIT', lat: 35.6762, lng: 139.6503, notes: 'Land in Narita/Haneda, settle in Shinjuku.' },
      { day_offset: 1, place_name: 'Shibuya & Harajuku', stop_type: 'TOURIST', lat: 35.6595, lng: 139.7005, notes: 'Shibuya Crossing, Meiji Shrine, Takeshita Street.' },
      { day_offset: 2, place_name: 'Senso-ji & Akihabara', stop_type: 'TOURIST', lat: 35.7148, lng: 139.7967, notes: 'Traditional Asakusa followed by anime/tech hub.' },
      { day_offset: 3, place_name: 'Shinkansen to Kyoto', stop_type: 'TRANSIT', lat: 35.0116, lng: 135.7681, notes: 'Bullet train to the ancient capital.' },
      { day_offset: 4, place_name: 'Fushimi Inari & Kiyomizu-dera', stop_type: 'TOURIST', lat: 34.9671, lng: 135.7727, notes: 'Thousand torii gates and historic wooden temple.' },
      { day_offset: 5, place_name: 'Arashiyama Bamboo Grove', stop_type: 'ACTIVITY', lat: 35.0094, lng: 135.6668, notes: 'Morning walk in the bamboo forest.' },
      { day_offset: 6, place_name: 'Osaka Dotonbori', stop_type: 'FOOD', lat: 34.6687, lng: 135.5013, notes: 'Short train to Osaka for epic street food (Takoyaki, Okonomiyaki).' },
      { day_offset: 7, place_name: 'Osaka Castle & Departure', stop_type: 'TOURIST', lat: 34.6873, lng: 135.5262, notes: 'Final sightseeing before flying out of KIX.' }
    ]
  }
];
