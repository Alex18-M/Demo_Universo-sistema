var CONFIG = {
  name: "Tu Empresa",
  initials: "TE",
  currency: "C$",
  brand: "#8b6cff",
  brand2: "#3d7bff",
  theme: "dark",
  users: [
    ["Laura Mendoza", "admin"],
    ["Carlos Pérez", "vendedor"],
    ["Ana Rivas", "vendedor"],
  ],
  products: [
    ["Producto A", "A-001", 85, 420, 15],
    ["Producto B", "B-002", 42, 650, 10],
    ["Producto C", "C-003", 18, 980, 8],
    ["Producto D", "D-004", 120, 150, 25],
    ["Producto E", "E-005", 9, 1350, 10],
    ["Producto F", "F-006", 60, 310, 12],
  ],
  history: [8200, 9400, 7100, 11800, 10300, 12600],
  demoBar:
    "Plantilla Universo (sistema a la medida) · Demo creada por Quark Studio · Datos de ejemplo",
};
/* ===== Fin de la configuración ===== */
var $ = function (i) {
    return document.getElementById(i);
  },
  C = CONFIG;
var P = C.products.map(function (p, i) {
    return {
      id: i,
      n: p[0],
      sku: p[1],
      stock: p[2],
      price: p[3],
      min: p[4],
      sold: [3, 5, 2, 9, 1, 4][i % 6],
    };
  }),
  SL = [],
  U = C.users.map(function (u) {
    return { n: u[0], r: u[1], on: true };
  }),
  me = null,
  view = "resumen",
  base = 4200;
function esc(s) {
  return String(s).replace(/[&<>"']/g, function (c) {
    return {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    }[c];
  });
}
function money(n) {
  return C.currency + " " + Math.round(n).toLocaleString("en-US");
}
function toast(t) {
  var e = $("toast");
  e.textContent = t;
  e.classList.add("show");
  clearTimeout(toast.t);
  toast.t = setTimeout(function () {
    e.classList.remove("show");
  }, 1800);
}
var R = document.documentElement;
R.style.setProperty("--brand", C.brand);
R.style.setProperty("--brand2", C.brand2);
R.setAttribute("data-theme", C.theme);
$("bar").textContent = C.demoBar;
if (!C.demoBar) $("bar").style.display = "none";
document.title = C.name + " · Sistema";
$("li").textContent = $("ai").textContent = C.initials;
$("ln").textContent = $("an").textContent = C.name;
$("lu").innerHTML = C.users
  .map(function (u, i) {
    return (
      '<option value="' +
      i +
      '">' +
      esc(u[0]) +
      " — " +
      (u[1] === "admin" ? "Administrador" : "Vendedor") +
      "</option>"
    );
  })
  .join("");
var NAV = [
  ["resumen", "📊", "Resumen", ["admin", "vendedor"]],
  ["ventas", "🧾", "Ventas", ["admin", "vendedor"]],
  ["inventario", "📦", "Inventario", ["admin", "vendedor"]],
  ["reportes", "📈", "Reportes", ["admin"]],
  ["usuarios", "👥", "Usuarios", ["admin"]],
];
function buildNav() {
  [].slice.call($("nav").querySelectorAll("button")).forEach(function (b) {
    b.remove();
  });
  NAV.forEach(function (n) {
    if (n[3].indexOf(me.r) < 0) return;
    var b = document.createElement("button");
    b.dataset.v = n[0];
    b.innerHTML = "<b>" + n[1] + "</b>" + n[2];
    $("nav").appendChild(b);
  });
}
$("nav").onclick = function (e) {
  var b = e.target.closest("button");
  if (b) {
    view = b.dataset.v;
    show();
  }
};
$("enter").onclick = function () {
  var u = U[$("lu").value];
  if (!u.on) {
    toast("Este usuario está desactivado");
    return;
  }
  me = u;
  document.body.classList.add("in");
  buildNav();
  view = "resumen";
  show();
  window.scrollTo(0, 0);
};
$("out").onclick = function () {
  document.body.classList.remove("in");
  me = null;
};
function totalToday() {
  return (
    base +
    SL.reduce(function (t, s) {
      return t + s.t;
    }, 0)
  );
}
function chart() {
  var d = C.history.concat([totalToday()]),
    max = Math.max.apply(null, d) * 1.15,
    W = 520,
    H = 200,
    bw = 44,
    g = (W - d.length * bw) / (d.length + 1),
    days = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Hoy"],
    s = "";
  d.forEach(function (v, i) {
    var h = (v / max) * (H - 34),
      x = g + i * (bw + g),
      y = H - 22 - h;
    s +=
      '<rect x="' +
      x +
      '" y="' +
      y +
      '" width="' +
      bw +
      '" height="' +
      h +
      '" rx="9" fill="' +
      (i === d.length - 1 ? "url(#gr)" : "var(--soft)") +
      '"/><text class="val" x="' +
      (x + bw / 2) +
      '" y="' +
      (y - 6) +
      '" text-anchor="middle">' +
      (v >= 1000 ? (v / 1000).toFixed(1) + "k" : v) +
      '</text><text class="lab" x="' +
      (x + bw / 2) +
      '" y="' +
      (H - 6) +
      '" text-anchor="middle">' +
      days[i] +
      "</text>";
  });
  return (
    '<svg viewBox="0 0 ' +
    W +
    " " +
    H +
    '" role="img" aria-label="Ventas de los últimos 7 días"><defs><linearGradient id="gr" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--brand)"/><stop offset="1" stop-color="var(--brand2)"/></linearGradient></defs>' +
    s +
    "</svg>"
  );
}
function donut() {
  var by = { Efectivo: 0, Transferencia: 0, Tarjeta: 0 };
  SL.forEach(function (s) {
    by[s.m] += s.t;
  });
  by.Efectivo += 2400;
  by.Transferencia += 1100;
  by.Tarjeta += 700;
  var tot = 0,
    k = Object.keys(by);
  k.forEach(function (x) {
    tot += by[x];
  });
  var cols = ["#8b6cff", "#3d7bff", "#34d3a6"],
    off = 0,
    r = 60,
    c = 2 * Math.PI * r,
    s = "",
    lg = "";
  k.forEach(function (x, i) {
    var len = (by[x] / tot) * c;
    s +=
      '<circle cx="90" cy="90" r="' +
      r +
      '" fill="none" stroke="' +
      cols[i] +
      '" stroke-width="26" stroke-dasharray="' +
      len +
      " " +
      (c - len) +
      '" stroke-dashoffset="' +
      -off +
      '" transform="rotate(-90 90 90)"/>';
    off += len;
    lg +=
      '<div class="row"><span><i style="display:inline-block;width:10px;height:10px;border-radius:50%;background:' +
      cols[i] +
      ';margin-right:8px"></i>' +
      x +
      "</span><b>" +
      money(by[x]) +
      "</b></div>";
  });
  return (
    '<svg viewBox="0 0 180 180" style="max-width:200px;margin:0 auto 10px" role="img" aria-label="Ventas por método de pago">' +
    s +
    '<text x="90" y="95" text-anchor="middle" class="val" style="font-size:14px">' +
    money(tot) +
    "</text></svg>" +
    lg
  );
}
function status(p) {
  return p.stock <= 0
    ? ["bad", "Agotado"]
    : p.stock <= p.min
      ? ["low", "Stock bajo"]
      : ["ok", "Disponible"];
}
function render() {
  var low = P.filter(function (p) {
      return p.stock <= p.min;
    }).length,
    n = SL.length + 14;
  $("kp").innerHTML = [
    ["Ventas de hoy", money(totalToday()), "▲ 12% vs. ayer"],
    ["Pedidos", n, "hoy"],
    ["Ticket promedio", money(totalToday() / n), ""],
    ["Alertas de stock", low, low ? "revisar inventario" : "todo en orden"],
  ]
    .map(function (k) {
      return (
        '<div class="k"><span>' +
        k[0] +
        "</span><b>" +
        k[1] +
        "</b><em>" +
        k[2] +
        "</em></div>"
      );
    })
    .join("");
  $("ch").innerHTML = chart();
  var tp = P.slice()
      .sort(function (a, b) {
        return b.sold - a.sold;
      })
      .slice(0, 5),
    mx = tp[0].sold || 1;
  $("top").innerHTML = tp
    .map(function (p) {
      return (
        '<div class="row"><span>' +
        esc(p.n) +
        "<small>" +
        p.sold +
        ' vendidos</small></span><div class="bar" style="width:90px"><i style="width:' +
        (p.sold / mx) * 100 +
        '%"></i></div></div>'
      );
    })
    .join("");
  $("sp").innerHTML = P.map(function (p) {
    return (
      '<option value="' +
      p.id +
      '"' +
      (p.stock <= 0 ? " disabled" : "") +
      ">" +
      esc(p.n) +
      " · " +
      money(p.price) +
      " · stock " +
      p.stock +
      "</option>"
    );
  }).join("");
  $("sl").innerHTML = SL.length
    ? SL.slice()
        .reverse()
        .slice(0, 6)
        .map(function (s) {
          return (
            '<div class="row"><span>' +
            s.q +
            " × " +
            esc(s.n) +
            "<small>" +
            s.m +
            " · " +
            s.u +
            "</small></span><b>" +
            money(s.t) +
            "</b></div>"
          );
        })
        .join("")
    : '<p style="color:var(--mute)">Aún no hay ventas nuevas. Registra una y mira cómo cambian el resumen y el inventario.</p>';
  var q = $("iq").value.toLowerCase();
  $("it").innerHTML = P.filter(function (p) {
    return (p.n + p.sku).toLowerCase().indexOf(q) > -1;
  })
    .map(function (p) {
      var s = status(p);
      return (
        "<tr><td><b>" +
        esc(p.n) +
        "</b><br><small style='color:var(--mute)'>" +
        esc(p.sku) +
        "</small></td><td>" +
        money(p.price) +
        '</td><td><div class="bar ' +
        s[0] +
        '"><i style="width:' +
        Math.min(100, (p.stock / (p.min * 4 || 1)) * 100) +
        '%"></i></div>' +
        p.stock +
        '</td><td><span class="tag ' +
        s[0] +
        '">' +
        s[1] +
        "</span></td><td>" +
        (me && me.r === "admin"
          ? '<button class="btn g sm" data-r="' + p.id + '">+10</button>'
          : "") +
        "</td></tr>"
      );
    })
    .join("");
  $("dn").innerHTML = donut();
  var ing = totalToday();
  $("rs").innerHTML = [
    ["Ventas de hoy", money(ing)],
    ["Ventas nuevas", SL.length],
    ["Productos en inventario", P.length],
    [
      "Valor del inventario",
      money(
        P.reduce(function (t, p) {
          return t + p.stock * p.price;
        }, 0),
      ),
    ],
  ]
    .map(function (r) {
      return (
        '<div class="row"><span>' + r[0] + "</span><b>" + r[1] + "</b></div>"
      );
    })
    .join("");
  $("us").innerHTML = U.map(function (u, i) {
    return (
      '<div class="row"><span>' +
      esc(u.n) +
      "<small>" +
      (u.r === "admin"
        ? "Administrador · acceso total"
        : "Vendedor · ventas e inventario") +
      '</small></span><button class="btn g sm" data-u="' +
      i +
      '">' +
      (u.on ? "Activo" : "Inactivo") +
      "</button></div>"
    );
  }).join("");
}
function show() {
  if (!me) return;
  var t = {
    resumen: "Resumen del día",
    ventas: "Ventas",
    inventario: "Inventario",
    reportes: "Reportes",
    usuarios: "Usuarios y roles",
  };
  $("vt").textContent = t[view];
  $("wn").textContent = me.n;
  $("wr").textContent = me.r === "admin" ? "Administrador" : "Vendedor";
  document.querySelectorAll(".v").forEach(function (v) {
    v.classList.toggle("on", v.id === "v-" + view);
  });
  document.querySelectorAll("#nav button").forEach(function (b) {
    b.classList.toggle("on", b.dataset.v === view);
  });
  render();
}
$("sb").onclick = function () {
  var p = P[$("sp").value],
    q = Math.max(1, +$("sq").value || 1);
  if (q > p.stock) {
    toast("Solo hay " + p.stock + " en stock de " + p.n);
    return;
  }
  p.stock -= q;
  p.sold += q;
  SL.push({
    n: p.n,
    q: q,
    t: q * p.price,
    m: $("sm").value,
    u: me.n.split(" ")[0],
  });
  toast("Venta registrada: " + money(q * p.price));
  render();
};
$("iq").oninput = render;
$("it").onclick = function (e) {
  var b = e.target.closest("[data-r]");
  if (b) {
    P[b.dataset.r].stock += 10;
    toast("Stock actualizado");
    render();
  }
};
$("us").onclick = function (e) {
  var b = e.target.closest("[data-u]");
  if (b) {
    var u = U[b.dataset.u];
    if (u === me) {
      toast("No puedes desactivar tu propio usuario");
      return;
    }
    u.on = !u.on;
    render();
  }
};
