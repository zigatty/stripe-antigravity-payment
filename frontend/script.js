
async function handlePlan(planId) {

    const response = await fetch('http://localhost:5000/create-checkout-session', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ planId }),
    });

    const data = await response.json();

    if (data.url) {
        window.location.href = data.url;
    } else {
        alert("Free plan activated");
    }

}
