document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('tallas-form');
    form.addEventListener('submit', handleFormSubmit);
});

function handleFormSubmit(event) {
    event.preventDefault();

    const tallas = ['xs', 's', 'm', 'l', 'xl', 'xxl'];
    const quantities = tallas.reduce((acc, talla) => {
        const value = parseInt(document.getElementById(talla).value, 10);
        if (value > 0) {
            acc[talla] = value;
        }
        return acc;
    }, {});

    const results = calculateOptimalCosts(quantities);
    displayResults(results);
}

const PRECIOS = {
    PACK: 12.75,
    UNIDAD: 3.55,
    UNIDADES_POR_PACK: 5
};

function calculateOptimalCosts(quantities) {
    let currentPurchase = { items: [], total: 0 };
    let optimizedPurchase = { items: [], total: 0 };
    let recommendations = [];

    for (const talla in quantities) {
        const quantity = quantities[talla];
        const packs = Math.floor(quantity / PRECIOS.UNIDADES_POR_PACK);
        const looseUnits = quantity % PRECIOS.UNIDADES_POR_PACK;

        // --- Current Purchase Calculation ---
        const currentCost = (packs * PRECIOS.PACK) + (looseUnits * PRECIOS.UNIDAD);
        currentPurchase.total += currentCost;
        currentPurchase.items.push({
            talla,
            packs,
            looseUnits,
            cost: currentCost
        });

        // --- Optimized Purchase & Recommendation Calculation ---
        const costOfLooseUnits = looseUnits * PRECIOS.UNIDAD;

        // Recommendation logic: it's cheaper to buy a pack than 4 loose units.
        if (looseUnits >= 4) {
            const unitsToComplete = PRECIOS.UNIDADES_POR_PACK - looseUnits;
            const savings = costOfLooseUnits - PRECIOS.PACK;

            recommendations.push({
                talla,
                unitsToComplete,
                savings
            });

            const optimizedCost = (packs + 1) * PRECIOS.PACK;
            optimizedPurchase.total += optimizedCost;
            optimizedPurchase.items.push({
                talla,
                packs: packs + 1,
                looseUnits: 0,
                cost: optimizedCost
            });

        } else {
            // No optimization needed for this size
            optimizedPurchase.total += currentCost;
            optimizedPurchase.items.push({
                talla,
                packs,
                looseUnits,
                cost: currentCost
            });
        }
    }

    return { currentPurchase, optimizedPurchase, recommendations };
}

function displayResults(results) {
    const resultsContainer = document.getElementById('results');
    resultsContainer.innerHTML = '';

    let html = '';

    // --- Current Purchase ---
    html += `
        <div class="results-section">
            <h3>🛒 Compra Actual</h3>
            <div id="current-purchase-details">`;
    results.currentPurchase.items.forEach(item => {
        html += `<div class="result-item">
                    <span><b>Talla ${item.talla.toUpperCase()}:</b> ${item.packs > 0 ? `${item.packs} pack(s)` : ''} ${item.looseUnits > 0 ? `+ ${item.looseUnits} suelta(s)` : ''}</span>
                    <span>${item.cost.toFixed(2)}€</span>
                 </div>`;
    });
    html += `</div>
            <div class="result-item total-row">
                <span>TOTAL ACTUAL</span>
                <span>${results.currentPurchase.total.toFixed(2)}€</span>
            </div>
        </div>`;

    // --- Recommendations ---
    if (results.recommendations.length > 0) {
        html += `<div class="results-section">
                    <h3>💡 Recomendación Inteligente</h3>`;
        results.recommendations.forEach(rec => {
            const costOfLoose = (PRECIOS.UNIDADES_POR_PACK - rec.unitsToComplete) * PRECIOS.UNIDAD;
            html += `<div class="recommendation">
                        <p>¡Compra <b>${rec.unitsToComplete} unidad(es) más</b> de talla ${rec.talla.toUpperCase()}!</p>
                        <p>• Formarías 1 pack por <b>${PRECIOS.PACK.toFixed(2)}€</b> en lugar de pagar ${costOfLoose.toFixed(2)}€ por las unidades sueltas.</p>
                        <p class="savings">AHORRO EN ESTA TALLA: ${rec.savings.toFixed(2)}€</p>
                     </div>`;
        });
        html += `</div>`;
    }

    // --- Optimized Purchase ---
    html += `
        <div class="results-section optimized-purchase">
            <h3>🎯 Compra Optimizada</h3>
            <div id="optimized-purchase-details">`;
    results.optimizedPurchase.items.forEach(item => {
        html += `<div class="result-item">
                    <span><b>Talla ${item.talla.toUpperCase()}:</b> ${item.packs > 0 ? `${item.packs} pack(s)` : ''} ${item.looseUnits > 0 ? `+ ${item.looseUnits} suelta(s)` : ''}</span>
                    <span>${item.cost.toFixed(2)}€</span>
                 </div>`;
    });
    const totalSavings = results.currentPurchase.total - results.optimizedPurchase.total;
    html += `</div>
            <div class="result-item total-row">
                <span>TOTAL OPTIMIZADO</span>
                <span>${results.optimizedPurchase.total.toFixed(2)}€</span>
            </div>
            ${totalSavings > 0 ? `
            <div class="recommendation" style="margin-top: 1.5rem;">
                <p class="savings" style="font-size: 1.2rem; text-align: center;">AHORRO TOTAL: ${totalSavings.toFixed(2)}€</p>
            </div>
            ` : ''}
        </div>`;

    resultsContainer.innerHTML = html;
    resultsContainer.style.display = 'block';
}
