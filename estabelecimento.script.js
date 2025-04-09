document.addEventListener('DOMContentLoaded', () => {
    const deliveryForm = document.getElementById('delivery-form');
    const establishmentNameInput = document.getElementById('establishment-name');
    const customerNameInput = document.getElementById('customer-name');
    const deliveryAddressInput = document.getElementById('delivery-address');
    const orderIdInput = document.getElementById('order-id');
    const confirmationMessage = document.getElementById('confirmation-message');

    const PENDING_DELIVERY_KEY = 'pendingDelivery';

    // --- Communication Mechanism ---
    // NOTE: This uses localStorage for communication.
    // This works only if the Estabelecimento and Entregador views are open
    // in DIFFERENT TABS of the SAME BROWSER on the SAME DEVICE.
    //
    // For TRUE cross-device communication (different phones/computers),
    // a backend server or a real-time cloud service (like WebSockets,
    // Firebase Realtime Database, Pusher, Ably, etc.) is required.
    // The establishment would send the data to the server, and the server
    // would push it to the connected delivery person's app.
    // ---

    deliveryForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const existingPending = localStorage.getItem(PENDING_DELIVERY_KEY);
        if (existingPending) {
             try {
                // Check if it's valid JSON before alerting
                JSON.parse(existingPending);
                alert("Uma entrega já está pendente para ser aceita pelo entregador. Aguarde a finalização.");
                return;
             } catch {
                // If invalid JSON, allow overwriting
                console.warn("Overwriting potentially corrupt pending delivery data.");
                localStorage.removeItem(PENDING_DELIVERY_KEY); // Clear bad data
             }
        }

        const deliveryData = {
            id: orderIdInput.value || `ORD-${Date.now()}`,
            establishmentName: establishmentNameInput.value.trim(),
            customerName: customerNameInput.value.trim(),
            address: deliveryAddressInput.value.trim(),
            status: 'Pending',
            timestamp: Date.now()
        };

        if (!deliveryData.customerName || !deliveryData.address || !deliveryData.establishmentName) {
            alert("Por favor, preencha todos os campos obrigatórios.");
            return;
        }

        // try {
            // --- Send to Delivery Person (via localStorage simulation) ---
            // In a real app, this would be an API call to your backend:
            // fetch('/api/deliveries', { method: 'POST', body: JSON.stringify(deliveryData), ... })
            // The backend would then use WebSockets or similar to push to the driver.
            // localStorage.setItem(PENDING_DELIVERY_KEY, JSON.stringify(deliveryData));
            // ---

            //Simulate API call
            setTimeout(() => {
                createDelivery(deliveryData); // Send to "database"
                confirmationMessage.textContent = `Entrega #${deliveryData.id} enviada! Aguardando aceitação.`;
                confirmationMessage.classList.remove('hidden');
                setTimeout(() => {
                    confirmationMessage.classList.add('hidden');
                }, 5000);
            }, 500);

            console.log('Delivery sent (simulated API):', deliveryData);

            // Reset only customer-specific fields
            customerNameInput.value = '';
            deliveryAddressInput.value = '';
            orderIdInput.value = '';
            // Keep establishment name
            customerNameInput.focus();


        // } catch (error) {
        //     console.error('Error saving delivery to localStorage:', error);
        //     alert('Erro ao enviar a entrega. Verifique o console para mais detalhes.');
        // }
    });

    // Set focus on the first relevant field
    customerNameInput.focus();

    console.log("Establishment Script Initialized");
});

// --- Simulated Database ---
// (This would be on the "server" in a real application)
let deliveries = [];

function createDelivery(delivery) {
    deliveries.push(delivery);
}