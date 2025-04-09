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
    const establishmentNameSpan = document.getElementById('establishment-name');
    const acceptButton = document.getElementById('accept-button');
    const finalizeButton = document.getElementById('finalize-button');
    const historyList = document.getElementById('history-list');

    // --- State ---
    let currentDelivery = null;
    const COMPLETED_DELIVERIES_KEY = 'completedDeliveries'; // Key for history
    let completedDeliveries = JSON.parse(localStorage.getItem(COMPLETED_DELIVERIES_KEY)) || []; // Load history
    let deliveryCheckInterval = null;

    // --- Communication Mechanism ---
    // NOTE: This uses localStorage polling and the 'storage' event for communication.
    // This works only if the Estabelecimento and Entregador views are open
    // in DIFFERENT TABS of the SAME BROWSER on the SAME DEVICE.
    //
    // For TRUE cross-device communication (different phones/computers),
    // a backend server or a real-time cloud service (like WebSockets,
    // Firebase Realtime Database, Pusher, Ably, etc.) is required.
    // The delivery person's app would connect to the service (e.g., via WebSocket)
    // and listen for 'new_delivery' events pushed by the server when an
    // establishment creates one. Polling localStorage would be replaced
    // by this real-time subscription.
    // ---

    // --- Functions ---

    function displayDelivery(delivery) {
        console.log("Displaying delivery:", delivery);
        if (!delivery || !delivery.id || !delivery.customerName || !delivery.address || !delivery.establishmentName) {
            console.error("Invalid delivery data received:", delivery);
            // Optionally clear the invalid data from localStorage if it wasn't already cleared
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
    }

    function clearCurrentDelivery() {
        currentDelivery = null;
        deliveryCard.classList.add('hidden');
        noDeliveryMessage.classList.remove('hidden');
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
                <span class="timestamp-hist">${new Date(delivery.timestamp).toLocaleTimeString()}</span>
            `;
            historyList.appendChild(listItem);
        });
    }

    function saveCompletedDeliveries() {
        try {
            localStorage.setItem(COMPLETED_DELIVERIES_KEY, JSON.stringify(completedDeliveries));
        } catch (error) {
            console.error("Error saving completed deliveries:", error);
            // Handle potential storage quota issues if necessary
        }
    }

    function fetchDelivery() {
        if (currentDelivery) return;

        // Simulate API call
        setTimeout(() => {
            const delivery = getPendingDelivery(); // Get from "database"
            if (delivery) {
                displayDelivery(delivery);
            }
        }, 500);
    }

    function startCheckingForDeliveries() {
        if (deliveryCheckInterval) return;
        console.log("Starting to poll for deliveries every 3 seconds.");
        fetchDelivery();
        deliveryCheckInterval = setInterval(fetchDelivery, 3000);
    }

    function stopCheckingForDeliveries() {
        if (deliveryCheckInterval) {
            clearInterval(deliveryCheckInterval);
            deliveryCheckInterval = null;
            console.log("Stopping delivery polling.");
        }
    }

    // --- Event Listeners ---

    acceptButton?.addEventListener('click', () => {
        if (!currentDelivery) return;

        acceptButton.disabled = true;
        finalizeButton.disabled = false;
        currentDelivery.status = 'Accepted';
        console.log(`Entrega #${currentDelivery.id} aceita.`);

        //Simulate API call
        setTimeout(() => {
            updateDeliveryStatus(currentDelivery.id, 'Accepted'); // Update "database"
        }, 500);
        // In a real app, you might notify the backend/establishment here
    });

    finalizeButton?.addEventListener('click', () => {
        if (!currentDelivery || acceptButton.disabled === false) return;

        console.log(`Entrega #${currentDelivery.id} finalizada.`);
        currentDelivery.status = 'Finalized';
        currentDelivery.finalizedTimestamp = Date.now(); // Add finalized time
        completedDeliveries.push(currentDelivery);
        saveCompletedDeliveries();
        updateHistoryList();
        clearCurrentDelivery();

        //Simulate API call
        setTimeout(() => {
            updateDeliveryStatus(currentDelivery.id, 'Finalized'); // Update "database"
        }, 500);
        // In a real app, notify backend/establishment
    });

    // History Menu
    historyToggle?.addEventListener('click', () => {
        historyMenu.classList.toggle('visible');
        if (historyMenu.classList.contains('visible')) {
            updateHistoryList(); // Refresh history when opening
        }
    });

    closeHistoryButton?.addEventListener('click', () => {
        historyMenu.classList.remove('visible');
    });

    mainContent?.addEventListener('click', (event) => {
         if (historyMenu?.classList.contains('visible') && !historyMenu.contains(event.target) && event.target !== historyToggle && !historyToggle?.contains(event.target)) {
            historyMenu.classList.remove('visible');
        }
    });

    // --- Initialization ---
    console.log("Delivery Person Script Initialized");
    updateHistoryList(); // Load history on start
    startCheckingForDeliveries(); // Start checking for new deliveries immediately

});

// --- Simulated Database ---
let deliveries = [];

function getPendingDelivery() {
    return deliveries.find(delivery => delivery.status === 'Pending');
}

function updateDeliveryStatus(id, status) {
    const delivery = deliveries.find(delivery => delivery.id === id);
    if (delivery) {
        delivery.status = status;
    }
}