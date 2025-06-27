const mapElement = document.getElementById('map');
if(mapElement) {
    const locations = JSON.parse(mapElement.dataset.locations);
    
    mapboxgl.accessToken =
      'pk.eyJ1Ijoic3l0ZW5rb3JhbmciLCJhIjoiY21jMzlvbDFlMDJtZjJtczh5cGw3bHJ5aiJ9.h21y9iPUi8dvKw0UiM3MTg';
    const map = new mapboxgl.Map({
      container: 'map', // container ID
      style: 'mapbox://styles/sytenkorang/cmc451ga8020j01sc1ru2b225', // style URL
      scrollZoom: false // Don't allow map to zoom when you scroll the map section
    });
    
    const bounds = new mapboxgl.LngLatBounds();
    
    locations.forEach(location => {
        // Create marker
        const el = document.createElement('div');
        el.className = 'marker';
    
        // Add marker
        new mapboxgl.Marker({
            element: el, 
            anchor: 'bottom', // It's the bottom (end) of the pin that will be displayed on the exact GPS coordinate
        }).setLngLat(location.coordinates).addTo(map);
    
        // Add popup
        new mapboxgl.Popup({
            offset: 35
        })
        .setLngLat(location.coordinates)
        .setHTML(`<p>Day ${location.day} ${location.description}</p>`)
        .addTo(map);
    
        // Extend map bounds to include current location
        bounds.extend(location.coordinates)
    });
    
    map.fitBounds(bounds, {
        padding: {
            top: 200,
            bottom: 150,
            left: 100, 
            right: 100
        }
    });
    
}