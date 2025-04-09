document.addEventListener('DOMContentLoaded', () => {
    const deliveryForm = document.getElementById('delivery-form');
    const establishmentNameInput = document.getElementById('establishment-name');
    const customerNameInput = document.getElementById('customer-name');
    const deliveryAddressInput = document.getElementById('delivery-address');
    const orderIdInput = document.getElementById('order-id');
    const confirmationMessage = document.getElementById('confirmation-message');

    const PENDING_DELIVERY_KEY = 'pendingDelivery'; 

    deliveryForm.addEventListener('submit', (event) => {
        event.preventDefault(); 

        const existingPending = localStorage.getItem(PENDING_DELIVERY_KEY);
        if (existingPending) {
             try {
                const parsed = JSON.parse(existingPending);
                alert("Uma entrega já está pendente. Aguarde a finalização.");
                return;
             } catch {
                console.warn("Overwriting potentially corrupt pending delivery data.");
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

        try {
            localStorage.setItem(PENDING_DELIVERY_KEY, JSON.stringify(deliveryData));

            console.log('Delivery sent:', deliveryData);

            confirmationMessage.classList.remove('hidden');
            setTimeout(() => {
                confirmationMessage.classList.add('hidden');
            }, 3000); 

            deliveryForm.reset(); 
            if (!establishmentNameInput.value) {
                establishmentNameInput.value = "Restaurante Exemplo";
            }

        } catch (error) {
            console.error('Error saving delivery to localStorage:', error);
            alert('Erro ao enviar a entrega. Verifique o console para mais detalhes.');
        }
    });

    console.log("Establishment Script Initialized");
});