const emailPriceAlertTemplate = (user, data) => {
    const rows = data.map(({ alert, product, history = []}) => {
        const historyChangesRows = history.map(item => {
          const decrease = item.direction === 'DECREASE';
          const color = decrease ? '#dc2626' : '#16a34a';
          
          return `
            <tr>
              <td style="padding:12px;border-bottom:1px solid #eee;">
                  <strong>${product.title}</strong>
              </td>

              <td style="padding:12px;border-bottom:1px solid #eee;">
                  ${product.currency} ${item.old_price}
              </td>

              <td style="padding:12px;border-bottom:1px solid #eee;">
                  <strong>${product.currency} ${item.new_price}</strong>
              </td>

              <td style="
                  padding:12px;
                  border-bottom:1px solid #eee;
                  color:${color};
                  font-weight:bold;
              ">
                  ${decrease ? '↓' : '↑'}
                  ${decrease ? '-' : '+'}${item.percentage}%
              </td>

              <td style="padding:12px;border-bottom:1px solid #eee;">
                  ${product.currency} ${alert.target_price}
              </td>
            </tr>`
        }).join('');
      
      return historyChangesRows;
    });

      return `
    <div style="
      max-width:700px;
      margin:auto;
      padding:24px;
      font-family:Arial,sans-serif;
      color:#1f2937;
    ">

      <h2>🔔 Alertas de precios</h2>

      <p>
        Hola <strong>${user.name}</strong>,
      </p>

      <p>
        Hemos detectado cambios de precio en los productos
        que estás siguiendo:
      </p>

      <table
        width="100%"
        cellpadding="0"
        cellspacing="0"
        style="
          border-collapse:collapse;
          font-size:14px;
        "
      >
        <thead>
          <tr style="background:#f3f4f6;">
            <th align="left" style="padding:12px;">Producto</th>
            <th align="left" style="padding:12px;">Precio anterior</th>
            <th align="left" style="padding:12px;">Precio actual</th>
            <th align="left" style="padding:12px;">Cambio</th>
            <th align="left" style="padding:12px;">Objetivo</th>
          </tr>
        </thead>

        <tbody>
          ${rows}
        </tbody>
      </table>

      <p style="
        margin-top:24px;
        font-size:12px;
        color:#9ca3af;
      ">
        Estás recibiendo este correo porque tienes alertas
        de precio activas en Product Tracker.
      </p>

    </div>
  `;
}

module.exports = emailPriceAlertTemplate;