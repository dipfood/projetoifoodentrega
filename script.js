document.addEventListener('DOMContentLoaded', () => {
    // --- Common Elements ---
    const historyToggle = document.getElementById('history-toggle');
    const historyMenu = document.getElementById('history-menu');
    const closeHistoryButton = document.getElementById('close-history');
    const mainContent = document.getElementById('main-content'); // Used for closing menu

    // --- Delivery Person Specific Elements ---
    const noDeliveryMessage = document.getElementById('no-delivery');
    const deliveryCard = document.getElementById('delivery-card');
    const orderIdSpan = document.getElementById('order-id');
    const customerNameSpan = document.getElementById('customer-name');
    const deliveryAddressSpan = document.getElementById('delivery-address');
    const establishmentNameSpan = document.getElementById('establishment-name'); // Added
    const acceptButton = document.getElementById('accept-button');
    const finalizeButton = document.getElementById('finalize-button');
    // const simulateDeliveryButton = document.getElementById('simulate-new-delivery'); // Removed
    const historyList = document.getElementById('history-list');

    // --- State ---
    let currentDelivery = null;
    const PENDING_DELIVERY_KEY = 'pendingDelivery'; // Key for localStorage communication
    const COMPLETED_DELIVERIES_KEY = 'completedDeliveries'; // Key for history
    let completedDeliveries = JSON.parse(localStorage.getItem(COMPLETED_DELIVERIES_KEY)) || []; // Load history
    let checkInterval = null; // To store the interval ID

    // --- Functions ---

    function displayDelivery(delivery) {
        console.log("Displaying delivery:", delivery);
        if (!delivery || !delivery.id || !delivery.customerName || !delivery.address || !delivery.establishmentName) {
            console.error("Invalid delivery data received:", delivery);
            // Optionally clear the invalid data from localStorage
            // localStorage.removeItem(PENDING_DELIVERY_KEY);
            return; // Don't display incomplete data
        }

        currentDelivery = delivery;
        orderIdSpan.textContent = delivery.id;
        customerNameSpan.textContent = delivery.customerName;
        deliveryAddressSpan.textContent = delivery.address;
        establishmentNameSpan.textContent = delivery.establishmentName; // Display establishment name

        noDeliveryMessage.classList.add('hidden');
        deliveryCard.classList.remove('hidden');
        acceptButton.disabled = false;
        finalizeButton.disabled = true;
        // simulateDeliveryButton.classList.add('hidden'); // Button removed
    }

    function clearCurrentDelivery() {
        currentDelivery = null;
        deliveryCard.classList.add('hidden');
        noDeliveryMessage.classList.remove('hidden');
        // simulateDeliveryButton.classList.remove('hidden'); // Button removed
        startCheckingForDeliveries(); // Start checking again once free
    }

    function updateHistoryList() {
        historyList.innerHTML = ''; // Clear the current list
        if (completedDeliveries.length === 0) {
            historyList.innerHTML = '<li>Nenhuma entrega finalizada ainda.</li>';
            return;
        }

        // Display in reverse chronological order (newest first)
        [...completedDeliveries].reverse().forEach(delivery => {
            const listItem = document.createElement('li');
            listItem.innerHTML = `
                Pedido #${delivery.id} - ${delivery.customerName}
                <span class="establishment-hist">De: ${delivery.establishmentName || 'Estabelecimento Desconhecido'}</span>
            `;
            historyList.appendChild(listItem);
        });
    }

    function saveCompletedDeliveries() {
        localStorage.setItem(COMPLETED_DELIVERIES_KEY, JSON.stringify(completedDeliveries));
    }

    // Function to check localStorage for new deliveries
    function checkForNewDelivery() {
        // console.log("Checking for new delivery..."); // Uncomment for debugging
        if (currentDelivery) {
             // console.log("Already have an active delivery. Skipping check."); // Uncomment for debugging
             stopCheckingForDeliveries(); // Stop checking if busy
             return;
        }

        const pendingDeliveryData = localStorage.getItem(PENDING_DELIVERY_KEY);
        if (pendingDeliveryData) {
            console.log("Found pending delivery data:", pendingDeliveryData);
            try {
                const newDelivery = JSON.parse(pendingDeliveryData);
                // Important: Remove the item *before* displaying to avoid race conditions
                localStorage.removeItem(PENDING_DELIVERY_KEY);
                stopCheckingForDeliveries(); // Stop checking once a delivery is found
                displayDelivery(newDelivery);
            } catch (error) {
                console.error("Error parsing pending delivery data:", error);
                // Clear potentially corrupted data
                localStorage.removeItem(PENDING_DELIVERY_KEY);
            }
        }
    }

    // Start periodic check
    function startCheckingForDeliveries() {
        if (checkInterval) return; // Already checking
        console.log("Starting to check for deliveries every 3 seconds.");
        // Check immediately first
        checkForNewDelivery();
        // Then check periodically
        checkInterval = setInterval(checkForNewDelivery, 3000); // Check every 3 seconds
    }

    // Stop periodic check
    function stopCheckingForDeliveries() {
         if (checkInterval) {
             console.log("Stopping delivery checks.");
            clearInterval(checkInterval);
            checkInterval = null;
         }
    }

    // --- Event Listeners ---

    // Event Listener for the button Aceitar
    acceptButton?.addEventListener('click', () => { // Added safety check
        if (!currentDelivery) return;

        acceptButton.disabled = true;
        finalizeButton.disabled = false;
        // Update delivery status (optional, visual or internal state)
        currentDelivery.status = 'Accepted';
        console.log(`Entrega #${currentDelivery.id} aceita.`);
    });

    // Event Listener for the button Finalizar
    finalizeButton?.addEventListener('click', () => { // Added safety check
        if (!currentDelivery || acceptButton.disabled === false) return; // Only finalize if accepted

        console.log(`Entrega #${currentDelivery.id} finalizada.`);
        currentDelivery.status = 'Finalized';
        completedDeliveries.push(currentDelivery); // Add to history
        saveCompletedDeliveries(); // Save history to localStorage
        updateHistoryList(); // Update the history menu
        clearCurrentDelivery(); // Clear the current delivery from the main view
    });

    // Removed simulate button listener
    // simulateDeliveryButton.addEventListener('click', simulateNewDelivery);

    // Event Listeners for the History Menu
    historyToggle?.addEventListener('click', () => { // Added safety check
        historyMenu.classList.toggle('visible');
    });

    closeHistoryButton?.addEventListener('click', () => { // Added safety check
        historyMenu.classList.remove('visible');
    });

    // Close the menu if clicking outside of it
    mainContent?.addEventListener('click', (event) => { // Added safety check
         if (historyMenu?.classList.contains('visible') && !historyMenu.contains(event.target) && event.target !== historyToggle && !historyToggle?.contains(event.target)) {
            historyMenu.classList.remove('visible');
        }
    });

     // Listen for storage changes from other tabs/windows (optional but good practice)
     window.addEventListener('storage', (event) => {
        // console.log("Storage event detected:", event.key); // Debugging
        if (event.key === PENDING_DELIVERY_KEY && !currentDelivery) {
            console.log("Pending delivery key changed in storage, checking...");
            checkForNewDelivery(); // Re-check immediately if the relevant key changed
        }
         if (event.key === COMPLETED_DELIVERIES_KEY) {
            console.log("Completed deliveries updated in storage, reloading history...");
            completedDeliveries = JSON.parse(localStorage.getItem(COMPLETED_DELIVERIES_KEY)) || [];
            updateHistoryList(); // Update history if changed elsewhere
         }
    });


    // --- Initialization ---
    console.log("Delivery Person Script Initialized");
    updateHistoryList(); // Load history on start
    startCheckingForDeliveries(); // Start checking for new deliveries immediately

});