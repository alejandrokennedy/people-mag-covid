function measureText(string, fontSize = 10) {
  const widths = [
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0.278125, 0.278125, 0.35625, 0.55625, 0.55625,
    0.890625, 0.6671875, 0.1921875, 0.334375, 0.334375, 0.390625, 0.584375,
    0.278125, 0.334375, 0.278125, 0.303125, 0.55625, 0.55625, 0.55625, 0.55625,
    0.55625, 0.55625, 0.55625, 0.55625, 0.55625, 0.55625, 0.278125, 0.278125,
    0.5859375, 0.584375, 0.5859375, 0.55625, 1.015625, 0.6671875, 0.6671875,
    0.7234375, 0.7234375, 0.6671875, 0.6109375, 0.778125, 0.7234375, 0.278125,
    0.5, 0.6671875, 0.55625, 0.834375, 0.7234375, 0.778125, 0.6671875, 0.778125,
    0.7234375, 0.6671875, 0.6109375, 0.7234375, 0.6671875, 0.9453125, 0.6671875,
    0.6671875, 0.6109375, 0.278125, 0.35625, 0.278125, 0.478125, 0.55625,
    0.334375, 0.55625, 0.55625, 0.5, 0.55625, 0.55625, 0.278125, 0.55625,
    0.55625, 0.2234375, 0.2421875, 0.5, 0.2234375, 0.834375, 0.55625, 0.55625,
    0.55625, 0.55625, 0.334375, 0.5, 0.278125, 0.55625, 0.5, 0.7234375, 0.5,
    0.5, 0.5, 0.35625, 0.2609375, 0.3546875, 0.590625,
  ];
  const avg = 0.5293256578947368;
  return (
    string
      .split("")
      .map((c) =>
        c.charCodeAt(0) < widths.length ? widths[c.charCodeAt(0)] : avg,
      )
      .reduce((cur, acc) => acc + cur) * fontSize
  );
}

//--------------------------
// BAR CHART RACE SETUP
//--------------------------

const barChartContainer = d3.select("#barChartContainer");

let barChartBounds = barChartContainer.node().getBoundingClientRect(),
  barChartMargin = { top: 16, right: 6, bottom: 6, left: 0 },
  barChartWidth =
    barChartBounds.width - barChartMargin.left - barChartMargin.right;
barChartHeight =
  barChartBounds.height - barChartMargin.top - barChartMargin.bottom;

const formatDate = d3.utcFormat("%B %d"),
  parseDateMDY = d3.timeParse("%m/%d/%y"),
  parseDateYMD = d3.timeParse("%y/%m/%d"),
  formatNumber = d3.format(",d"),
  formatNoDec = d3.format(".0f"),
  formatPerc = d3.format(".2%");
((barSize = 45),
  (fillOpacity = 0.6),
  (maxTickNum = barChartWidth / 80),
  (labelPadding = 6),
  (deathPadding = 2));

let barToScreenRatio = barChartHeight / barSize - 0.5,
  n = Math.floor(barToScreenRatio),
  k = 3,
  pause = 5000,
  nameField = "state",
  valueField = "cases",
  // duration = 7000
  // duration = 5000
  // duration = 3500
  // duration = 2000
  // duration = 1000
  // duration = 500
  // duration = 260
  duration = 250;
// duration = 200
// duration = 120
// duration = 100
// duration = 80
// duration = 30
// duration = 1

const x = d3.scaleLinear(
  [0, 1],
  [barChartMargin.left, barChartWidth - barChartMargin.right],
);

// declare axis outside axis function so I can update tick length
let axisTop = d3.axisTop(x);

const y = d3
  .scaleBand()
  .domain(d3.range(n + 1))
  .rangeRound([
    barChartMargin.top,
    barChartMargin.top + barSize * (n + 1 + 0.1),
  ])
  .padding(0.1);

const rightSvg = barChartContainer
  .append("svg")
  .attr("id", "rightSvg")
  .attr("width", barChartWidth)
  .attr("height", barChartHeight);

const expandCollapse = rightSvg.append("g");

expandCollapse
  .attr("transform", `translate(${0},${barChartHeight - 25})`)
  .attr("cursor", "pointer")
  .attr("id", "expandCollapse")
  .attr("class", "collapsed");

expandCollapse
  .append("rect")
  .attr("height", "20px")
  .attr("width", barChartWidth - labelPadding * 6)
  .attr("fill", "white")
  .attr("x", labelPadding * 3)
  .attr("stroke", "#909090")
  .attr("rx", 5);

const ecText = expandCollapse
  .append("text")
  .attr("fill", "black")
  .text("More")
  .attr("text-anchor", "middle")
  .attr("x", barChartWidth / 2)
  .attr("y", 15)
  .raise();

//--------------------------
// BUBBLE LEGEND SETUP
//--------------------------

const bubTickMin = 25000;
const tickCount = 2;
const maxBubTicks = tickCount + 3;

//--------------------------
// MAP SETUP
//--------------------------

const mapContainer = d3.select("#mapContainer");

const mapBounds = mapContainer.node().getBoundingClientRect(),
  mapWidth = mapBounds.width,
  mapHeight = mapBounds.width * 0.58125;

const radiusScale = d3
  .scaleSqrt()
  .domain([0, 200000])
  .range([0, mapWidth / 12.8]);

// placing this after width and height so that radius scale (which relies on width) can inform mapMargin.top
const mapMargin = {
  top: radiusScale.range()[1] * 2 - radiusScale(bubTickMin),
  right: 0,
  bottom: 0,
  left: 0,
};

mapContainer.style("padding-bottom", `${mapHeight + mapMargin.top}px`);

const mapSvg = mapContainer
  .append("svg")
  .attr("class", "mapSvg")
  .attr("width", mapWidth + mapMargin.left + mapMargin.right)
  .attr("height", mapHeight + mapMargin.top + mapMargin.bottom + 117);

const mapGContainer = mapSvg
  .append("g")
  .attr("class", "mapGContainer")
  .attr("transform", `translate(${mapMargin.left},${mapMargin.top})`);

//--------------------------
// SCRUBBER SETUP
//--------------------------

function Scrubber({
  format = (value) => value,
  initial = 0,
  delay = null,
  autoplay = true,
  loop = true,
  alternate = false,
} = {}) {
  const form = d3.select("#scrubberForm").node();

  let timer = null;
  let direction = 1;
  function start() {
    form.b.textContent = "Pause";
    timer =
      delay === null ? requestAnimationFrame(tick) : setInterval(tick, delay);
  }
  function stop() {
    form.b.textContent = "Play";
    if (delay === null) cancelAnimationFrame(timer);
    else clearInterval(timer);
    timer = null;
  }
  function tick() {
    if (delay === null) timer = requestAnimationFrame(tick);
    if (
      form.i.valueAsNumber ===
      (direction > 0 ? keyframes.length - 1 : direction < 0 ? 0 : NaN)
    ) {
      if (!loop) return stop();
      if (alternate) direction = -direction;
    }
    form.i.valueAsNumber =
      (form.i.valueAsNumber + direction + keyframes.length) % keyframes.length;
    form.i.dispatchEvent(new CustomEvent("input", { bubbles: true }));
  }
  form.i.oninput = (event) => {
    if (event && event.isTrusted && timer) form.b.onclick();
    form.value = keyframes[form.i.valueAsNumber];
  };
  form.b.onclick = () => {
    if (timer) return stop();
    direction =
      alternate && form.i.valueAsNumber === keyframes.length - 1 ? -1 : 1;
    form.i.valueAsNumber =
      (form.i.valueAsNumber + direction) % keyframes.length;
    form.i.dispatchEvent(new CustomEvent("input", { bubbles: true }));
    start();
  };
  form.i.oninput();
  if (autoplay) start();
  else stop();
  return form;
}

//--------------------------
// LEGEND SETUP
//--------------------------

const colorContainer = d3.select("#colorContainer");

function legend({
  color,
  title,
  tickSize = 6,
  width = 320,
  height = 44 + tickSize,
  marginTop = 18,
  marginRight = 0,
  marginBottom = 16 + tickSize,
  marginLeft = 0,
  ticks = width / 64,
  tickFormat,
  tickValues,
} = {}) {
  const svg = colorContainer
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", [0, 0, width, height])
    .style("overflow", "visible")
    .style("display", "block");

  let tickAdjust = (g) =>
    g.selectAll(".tick line").attr("y1", marginTop + marginBottom - height);
  let x;

  // Continuous
  if (color.interpolate) {
    const n = Math.min(color.domain().length, color.range().length);

    x = color
      .copy()
      .rangeRound(
        d3.quantize(d3.interpolate(marginLeft, width - marginRight), n),
      );

    svg
      .append("image")
      .attr("x", marginLeft)
      .attr("y", marginTop)
      .attr("width", width - marginLeft - marginRight)
      .attr("height", height - marginTop - marginBottom)
      .attr("preserveAspectRatio", "none")
      .attr(
        "xlink:href",
        ramp(
          color.copy().domain(d3.quantize(d3.interpolate(0, 1), n)),
        ).toDataURL(),
      );
  }

  // Sequential
  else if (color.interpolator) {
    x = Object.assign(
      color
        .copy()
        .interpolator(d3.interpolateRound(marginLeft, width - marginRight)),
      {
        range() {
          return [marginLeft, width - marginRight];
        },
      },
    );

    svg
      .append("image")
      .attr("x", marginLeft)
      .attr("y", marginTop)
      .attr("width", width - marginLeft - marginRight)
      .attr("height", height - marginTop - marginBottom)
      .attr("preserveAspectRatio", "none")
      .attr("xlink:href", ramp(color.interpolator()).toDataURL())
      .attr("opacity", fillOpacity);

    // scaleSequentialQuantile doesn't implement ticks or tickFormat.
    if (!x.ticks) {
      if (tickValues === undefined) {
        const n = Math.round(ticks + 1);
        tickValues = d3
          .range(n)
          .map((i) => d3.quantile(color.domain(), i / (n - 1)));
      }
      if (typeof tickFormat !== "function") {
        tickFormat = d3.format(tickFormat === undefined ? ",f" : tickFormat);
      }
    }
  }

  // Threshold
  else if (color.invertExtent) {
    const thresholds = color.thresholds
      ? color.thresholds() // scaleQuantize
      : color.quantiles
        ? color.quantiles() // scaleQuantile
        : color.domain(); // scaleThreshold

    const thresholdFormat =
      tickFormat === undefined
        ? (d) => d
        : typeof tickFormat === "string"
          ? d3.format(tickFormat)
          : tickFormat;

    x = d3
      .scaleLinear()
      .domain([-1, color.range().length - 1])
      .rangeRound([marginLeft, width - marginRight]);

    svg
      .append("g")
      .selectAll("rect")
      .data(color.range())
      .join("rect")
      .attr("x", (d, i) => x(i - 1))
      .attr("y", marginTop)
      .attr("width", (d, i) => x(i) - x(i - 1))
      .attr("height", height - marginTop - marginBottom)
      .attr("fill", (d) => d);

    tickValues = d3.range(thresholds.length);
    tickFormat = (i) => thresholdFormat(thresholds[i], i);
  }

  // Ordinal
  else {
    x = d3
      .scaleBand()
      .domain(color.domain())
      .rangeRound([marginLeft, width - marginRight]);

    svg
      .append("g")
      .selectAll("rect")
      .data(color.domain())
      .join("rect")
      .attr("x", x)
      .attr("y", marginTop)
      .attr("width", Math.max(0, x.bandwidth() - 1))
      .attr("height", height - marginTop - marginBottom)
      .attr("fill", color);

    tickAdjust = () => {};
  }

  svg
    .append("g")
    .attr("transform", `translate(0,${height - marginBottom})`)
    .call(
      d3
        .axisBottom(x)
        .ticks(ticks, typeof tickFormat === "string" ? tickFormat : undefined)
        .tickFormat(typeof tickFormat === "function" ? tickFormat : undefined)
        .tickSize(tickSize)
        .tickValues(tickValues),
    )
    .call(tickAdjust)
    .call((g) => g.select(".domain").remove())
    .call((g) =>
      g
        .append("text")
        .attr("x", marginLeft)
        .attr("y", marginTop + marginBottom - height - 6)
        .attr("fill", "currentColor")
        .attr("text-anchor", "start")
        .attr("font-weight", "bold")
        .text(title),
    );

  return svg.node();
}

function ramp(color, n = 256) {
  const canvas = d3
    .create("canvas")
    .attr("width", n)
    .attr("height", 1)
    .attr("id", "legCanvEl");

  const context = canvas.node().getContext("2d");
  for (let i = 0; i < n; ++i) {
    context.fillStyle = color(i / (n - 1));
    context.fillRect(i, 0, 1, 1);
  }
  return canvas.node();
}

//--------------------------
// LOAD DATA
//--------------------------

loadData();

async function loadData() {
  // for iframe
  const usData = await d3.json("us.json");
  const nytStates = await d3.csv(
    "https://raw.githubusercontent.com/nytimes/covid-19-data/master/us-states.csv",
    d3.autoType,
  );
  const pop = await d3.csv("censusPopEst2019.csv", d3.autoType);

  // for alphahyperfox
  // const nytStates = await d3.csv("https://raw.githubusercontent.com/nytimes/covid-19-data/master/us-states.csv", d3.autoType)
  // const usData = await d3.json("static/data/reachMapData/us.json")
  // const pop = await d3.csv("static/data/covAnim/censusPopEst2019.csv", d3.autoType)

  //--------------------------
  // MAP STUFF
  //--------------------------

  const statesData = topojson.feature(usData, usData.objects.states);

  const projection = d3.geoAlbersUsa().fitWidth(mapWidth, statesData);

  const geoPath = d3.geoPath().projection(projection);

  const states = mapGContainer
    .append("g")
    .attr("class", "states")
    .selectAll("path")
    .data(statesData.features)
    .enter()
    .append("path")
    .attr("class", (d) => `f${d.id} hidden`)
    .attr("d", geoPath);

  //--------------------------
  // BAR CHART RACE STUFF
  //--------------------------

  const popLookup = {};
  pop.forEach((d) => (popLookup[d.STATE] = d.POPESTIMATE2019));

  const centroidLookup = {};
  states.each((d) => (centroidLookup[d.id] = geoPath.centroid(d)));

  const nytFiltered = nytStates.filter(
    (d) => popLookup[d.fips] && !isNaN(centroidLookup[d.fips][0]),
  );

  const fipsLookup = {};
  d3.groups(
    nytFiltered,
    (d) => d.state,
    (d) => d.fips,
  )
    .map((x) => {
      return { [x[0]]: x[1][0][0] };
    })
    .forEach((d) => {
      fipsLookup[Object.keys(d)[0]] = {
        fips: Object.values(d)[0],
        centroid: centroidLookup[Object.values(d)[0]],
        pop: popLookup[Object.values(d)[0]],
      };
    });

  const names = new Set(nytFiltered.map((d) => d[nameField]));

  // OLD
  const dateValPrep = d3.rollup(
    nytFiltered,
    ([d]) => [d[valueField], d.deaths],
    (d) => +d.date,
    (d) => d[nameField],
  );
  // OLD //

  // ROLLING AVERAGE CALCULATIONS: daily changes instead of cumulative values
  const prevDayLookup = new Map();
  const dateValPrepRollAvg = d3.rollup(
    // Sort data by date first to ensure chronological processing
    nytFiltered.sort((a, b) => d3.ascending(+a.date, +b.date)),
    ([d]) => {
      const state = d[nameField];
      const prevDay = prevDayLookup.get(state) || [0, 0];

      // Calculate daily changes
      const dailyCases = d[valueField] - prevDay[0];
      const dailyDeaths = d.deaths - prevDay[1];

      // Update lookup for next day
      prevDayLookup.set(state, [d[valueField], d.deaths]);

      // Return daily changes instead of cumulative
      return [dailyCases, dailyDeaths];
    },
    (d) => +d.date,
    (d) => d[nameField],
  );

  // ROLLING AVERAGE CALCULATIONS
  const rollingAverageWindow = 14; // 2 weeks

  const datevaluesWithAverage = Array.from(dateValPrepRollAvg)
    .map(([date, data]) => [new Date(date), data])
    .sort(([a], [b]) => d3.ascending(a, b))
    .map((entry, i, arr) => {
      // Get previous 14 days
      const window = arr.slice(Math.max(0, i - rollingAverageWindow), i + 1);
      // Calculate averages
      const averages = new Map(
        [...entry[1]].map(([state, [cases, deaths]]) => {
          const stateWindow = window.map((d) => d[1].get(state) || [0, 0]);
          const avgCases = d3.mean(stateWindow, (d) => d[0]);
          const avgDeaths = d3.mean(stateWindow, (d) => d[1]);
          return [state, [avgCases, avgDeaths]];
        }),
      );
      return [entry[0], averages];
    });

  // const datevalues = datevaluesWithAverage

  //--------------------------

  // OLD
  const datevalues = Array.from(dateValPrep)
    .map(([date, data]) => [new Date(date), data])
    .sort(([a], [b]) => d3.ascending(a, b));
  // OLD //

  function rank(value) {
    const data = Array.from(names, (name) => {
      const count = value(name)[0];
      const deaths = value(name)[1];
      return { name, value: count, deaths: deaths || 0 };
    });
    data.sort((a, b) => d3.descending(a.value, b.value));
    for (let i = 0; i < data.length; ++i) {
      data[i].rank = Math.min(n, i);
      data[i].rankLong = Math.min(51, i);
    }
    return data;
  }

  //--------------------------
  // BAR RANKING
  //--------------------------

  function deathrank(value) {
    const data = Array.from(names, (name) => {
      const count = value(name)[0];
      const deaths = value(name)[1];
      return { name, value: count, deaths: deaths || 0 };
    });
    data.sort((a, b) => d3.descending(a.value, b.value));
    data.sort((a, b) => d3.descending(a.deaths, b.deaths));
    for (let i = 0; i < data.length; ++i) {
      data[i].rank = Math.min(n, i);
      data[i].rankLong = Math.min(51, i);
    }
    return data;
  }

  function percrank(value) {
    const data = Array.from(names, (name) => {
      const count = value(name)[0];
      const deaths = value(name)[1];
      return { name, value: count, deaths: deaths || 0 };
    });
    data.sort((a, b) =>
      d3.descending(
        a.value / fipsLookup[a.name].pop,
        b.value / fipsLookup[b.name].pop,
      ),
    );
    for (let i = 0; i < data.length; ++i) {
      data[i].rank = Math.min(n, i);
      data[i].rankLong = Math.min(51, i);
    }
    return data;
  }

  const posframes = [];
  const deathframes = [];
  const percframes = [];

  let ka, a, kb, b;
  for ([[ka, a], [kb, b]] of d3.pairs(datevalues)) {
    for (let i = 0; i < k; ++i) {
      const t = i / k;

      posframes.push([
        new Date(ka * (1 - t) + kb * t),
        rank((name) => {
          if (a.get(name) && b.get(name)) {
            return [
              a.get(name)[0] * (1 - t) + b.get(name)[0] * t,
              a.get(name)[1] * (1 - t) + b.get(name)[1] * t,
            ];
          } else {
            return [0, 0];
          }
        }),
      ]);

      deathframes.push([
        new Date(ka * (1 - t) + kb * t),
        deathrank((name) => {
          if (a.get(name) && b.get(name)) {
            return [
              a.get(name)[0] * (1 - t) + b.get(name)[0] * t,
              a.get(name)[1] * (1 - t) + b.get(name)[1] * t,
            ];
          } else {
            return [0, 0];
          }
        }),
      ]);

      percframes.push([
        new Date(ka * (1 - t) + kb * t),
        percrank((name) => {
          if (a.get(name) && b.get(name)) {
            return [
              a.get(name)[0] * (1 - t) + b.get(name)[0] * t,
              a.get(name)[1] * (1 - t) + b.get(name)[1] * t,
            ];
          } else {
            return [0, 0];
          }
        }),
      ]);
    }
  }

  posframes.push([
    new Date(kb),
    rank((name) => [b.get(name)[0], b.get(name)[1]]),
  ]);
  const nameframes = d3.groups(
    posframes.flatMap(([, data]) => data),
    (d) => d.name,
  );
  const posPrev = new Map(
    nameframes.flatMap(([, data]) => d3.pairs(data, (a, b) => [b, a])),
  );
  const posNext = new Map(nameframes.flatMap(([, data]) => d3.pairs(data)));

  deathframes.push([
    new Date(kb),
    deathrank((name) => [b.get(name)[0], b.get(name)[1]]),
  ]);
  const nameDeathFrames = d3.groups(
    deathframes.flatMap(([, data]) => data),
    (d) => d.name,
  );
  const deathPrev = new Map(
    nameDeathFrames.flatMap(([, data]) => d3.pairs(data, (a, b) => [b, a])),
  );
  const deathNext = new Map(
    nameDeathFrames.flatMap(([, data]) => d3.pairs(data)),
  );

  percframes.push([
    new Date(kb),
    percrank((name) => [b.get(name)[0], b.get(name)[1]]),
  ]);
  const namePercFrames = d3.groups(
    percframes.flatMap(([, data]) => data),
    (d) => d.name,
  );
  const percPrev = new Map(
    namePercFrames.flatMap(([, data]) => d3.pairs(data, (a, b) => [b, a])),
  );
  const percNext = new Map(
    namePercFrames.flatMap(([, data]) => d3.pairs(data)),
  );

  // SORTSELECT
  const sortSelect = d3.select("#sort-select").on("change", function () {
    setSort(this);
  });

  function setSort(el) {
    if (el.value === "deaths") {
      keyframes = deathframes;
      prev = deathPrev;
      next = deathNext;
    } else if (el.value === "cases") {
      keyframes = posframes;
      prev = posPrev;
      next = posNext;
    } else if (el.value === "perc") {
      keyframes = percframes;
      prev = percPrev;
      next = percNext;
    }
    play2Frames();
  }

  setSort(sortSelect.node());

  //-----------------------------
  // SCRUBBER & COLLAPSIBLE STUFF
  //-----------------------------

  const scrubber = Scrubber({
    format: ([date]) => formatDate(date),
    delay: duration,
    loop: false,
  });

  d3.select("#scrubInput").attr("max", keyframes.length - 1);

  let collapsed = true;

  function expandBCR(el) {
    if (el.classList.value === "expanded") {
      barChartContainer.style("height", "800px");
      expandCollapse.attr("class", "collapsed");
      ecText.text("More");

      // change fully to "collapsed" as master variable (no classes)
      collapsed = true;
    } else if (el.classList.value === "collapsed") {
      barChartContainer.style("height", "2380px");
      expandCollapse.attr("class", "expanded");
      ecText.text("Fewer");
      collapsed = false;
    }
    barChartBounds = barChartContainer.node().getBoundingClientRect();
    barChartWidth =
      barChartBounds.width - barChartMargin.left - barChartMargin.right;
    barChartHeight =
      barChartBounds.height - barChartMargin.top - barChartMargin.bottom;
    rightSvg.attr("height", barChartHeight);
    expandCollapse.attr("transform", `translate(${0},${barChartHeight - 25})`);
    barToScreenRatio = barChartHeight / barSize - 0.5;
    n = Math.floor(barToScreenRatio);
    y.rangeRound([
      barChartMargin.top,
      barChartMargin.top + barSize * (n + 1 + 0.1),
    ]).domain(d3.range(n + 1));
    axisTop.tickSizeInner(-barSize * (n + y.padding()));

    play2Frames();
  }

  function play2Frames() {
    if (d3.select("#playBTN").node().textContent === "Play") {
      const range = d3.select("#scrubInput").node();
      const form = d3.select("#scrubberForm").node();

      range.value = +range.value - 2;
      form.value = keyframes[+range.value - 2];

      d3.select("#playBTN").node().click();

      setTimeout(() => {
        d3.select("#playBTN").node().click();
      }, 300);
    }
  }

  expandCollapse.on("click", function () {
    expandBCR(this);
  });

  //--------------------------
  // COLOR LEGEND
  //--------------------------

  // const interpolator = d3.piecewise(d3.interpolateHsl, ["rgb(66, 129, 245)", "rgb(218, 66, 245)", "red"])

  // ACCESSIBLE:
  const interpolator = d3.piecewise(d3.interpolateHsl, [
    "#4EF1B1",
    "#5039e4",
    "red",
  ]);

  // function formatEven(num) { // format with even last decimal for scale
  //   const arr = d3.autoType(Array.from(d3.format('.4f')(num)))
  //   if (arr[5] > 0) {
  //     arr[4] += 1
  //     arr[5] = 0
  //     if (arr[4] % 2 != 0) arr[4] += 1
  //   }
  //   return arr.slice(0, 5).join().replace(/,/g, '')
  // }

  // OLD MAX PERCENT
  const maxPercent = d3.max(
    keyframes[keyframes.length - 1][1].map((d) => {
      const ratioInfected = d.value / fipsLookup[d.name].pop;
      return ratioInfected;
    }),
  );

  // OLD NEW MAX PERCENT
  // const maxPercent = d3.max(
  //   Array.from(datevaluesWithAverage[datevaluesWithAverage.length - 1][1]).map(
  //     ([state, [cases]]) => {
  //       const ratioInfected = cases / fipsLookup[state].pop;
  //       return ratioInfected;
  //     },
  //   ),
  // );

  // Create array of all infection percentages across all dates and states
  const allInfectionPercentages = datevaluesWithAverage.flatMap(
    ([date, stateMap]) =>
      Array.from(stateMap.entries()).map(
        ([state, [cases]]) => cases / fipsLookup[state].pop,
      ),
  );

  console.log(
    "Sample of infection percentages:",
    allInfectionPercentages.slice(0, 10),
  );
  console.log("Total number of percentages:", allInfectionPercentages.length);

  // NEW MAX PERCENT
  // const maxPercent = d3.max(allInfectionPercentages);
  console.log("maxPercent", maxPercent);

  // const colorScaleDomainMax = formatEven(maxPercent) > 0.02 ? formatEven(maxPercent) : 0.02

  // OLD COLOR SCALE DOMAIN MAX
  const colorScaleDomainMax = maxPercent > 0.02 ? maxPercent : 0.02;

  // NEW COLOR SCALE DOMAIN MAX
  // const colorScaleDomainMax = maxPercent > 0.0002 ? maxPercent : 0.0002

  // NEW???
  // const colorScaleDomainMax = maxPercent;
  //
  // const colorScaleDomainMax = 0.0002229006250922329

  console.log("colorScaleDomainMax", colorScaleDomainMax);

  const colorScale = d3
    .scaleSequential(interpolator)
    .domain([0, colorScaleDomainMax])
    .nice();

  legend({
    color: colorScale,
    interpolator,
    title: "Percentage of state population confirmed positive",
    tickFormat: ".1%",
    width: barChartWidth / 1.8,
    marginLeft: 15,
    marginRight: 15,
  });

  d3.select("#scrubInput").style("width", `${barChartWidth / 3}px`);

  //--------------------------
  // BUBBLE LEGEND
  //--------------------------

  const maxCount = d3.max(
    keyframes[keyframes.length - 1][1].map((d) => d.value),
  );
  console.log("maxCount", maxCount);
  console.log("* - * - * - *");

  function findTicks(n) {
    if (d3.ticks(bubTickMin, maxCount, n).length <= n) {
      return [
        d3.ticks(bubTickMin, maxCount, n),
        d3.tickIncrement(bubTickMin, maxCount, n),
      ];
    } else {
      return findTicks(n - 1);
    }
  }

  const foundTicks = findTicks(tickCount);
  const bubArr = foundTicks[0];
  const radStep = foundTicks[1];

  if (bubArr[bubArr.length - 1] < maxCount)
    bubArr.push(bubArr[bubArr.length - 1] + radStep);

  getSmallBubble(bubTickMin);

  function getSmallBubble(n) {
    if (bubArr[0] > bubTickMin && bubArr.length < maxBubTicks) {
      const step =
        bubArr[0] - radStep > 0
          ? bubArr[0] - radStep
          : parseInt(
              d3
                .format(",.2r")(bubArr[0] / 2)
                .replace(/,/g, ""),
            );
      bubArr.unshift(step);
      if (bubArr[0] > bubTickMin && bubArr.length < maxBubTicks) {
        getSmallBubble(bubTickMin);
      }
    }
  }

  radiusScale.domain([0, bubArr[bubArr.length - 1]]);

  const bubMargin = { top: 5, left: mapWidth / 3.2, bottom: 10, right: 15 };

  const bubbleLegend = mapSvg
    .append("g")
    .attr("class", "bubbleLegend")
    .attr("font-size", "10px");

  const bubbles = bubbleLegend.selectAll("g").data(bubArr).join("g");

  bubbleLegend
    .append("text")
    .attr("class", "bubbleLegendTitle")
    .text("Number of confirmed cases")
    .attr("font-weight", "bold")
    .attr(
      "dy",
      radiusScale.range()[1] -
        radiusScale(bubbles.data()[bubbles.data().length - 3]) -
        5,
    );

  const reductionScale = d3
    .scaleLinear()
    .domain([640 - barChartMargin.right, 400])
    .range([0, 8]);

  let circMargin = 0;
  bubbles
    .attr("transform", (d, i) => {
      circMargin +=
        i === 0
          ? 0
          : radiusScale(bubbles.data()[i - 1]) * 2 +
            d3.min([15, barChartWidth / 15 - reductionScale(barChartWidth)]);
      return `translate(${circMargin + radiusScale(d)}, 0)`;
    })
    .append("circle")
    .attr("class", "bubCircle")
    .attr("fill", "#888")
    .attr(
      "cy",
      (d) =>
        radiusScale(d) -
        radiusScale(d) +
        radiusScale(bubbles.data()[bubbles.data().length - 1]),
    )
    .attr("r", (d) => radiusScale(d))
    .attr("opacity", fillOpacity);

  bubbles
    .append("circle")
    .attr("fill", "black")
    .attr(
      "cy",
      (d) =>
        radiusScale(d) -
        radiusScale(d) +
        radiusScale(bubbles.data()[bubbles.data().length - 1]),
    )
    .attr("r", (d) => radiusScale(d / 22))
    .attr("fill-opacity", 0.75);

  bubbles
    .append("text")
    .attr("y", (d) => radiusScale.range()[1] * 1.3 + radiusScale(d))
    .attr("text-anchor", "middle")
    .text((d) => formatNumber(d));

  const lastBubG = d3.select(bubbles.nodes()[bubbles.nodes().length - 1]);

  lastBubG
    .append("line")
    .attr("x1", (d) => radiusScale(d / 22) + 3)
    .attr("x2", (d) => radiusScale(d) + 10)
    .attr(
      "y1",
      (d) =>
        radiusScale(d) -
        radiusScale(d) +
        radiusScale(bubbles.data()[bubbles.data().length - 1]),
    )
    .attr(
      "y2",
      (d) =>
        radiusScale(d) -
        radiusScale(d) +
        radiusScale(bubbles.data()[bubbles.data().length - 1]),
    )
    .attr("stroke", "black")
    .attr("opacity", fillOpacity);

  lastBubG
    .append("text")
    .attr("x", (d) => radiusScale(d) + 13)
    .attr(
      "y",
      (d) =>
        radiusScale(d) -
        radiusScale(d) +
        radiusScale(bubbles.data()[bubbles.data().length - 1]),
    )
    .attr("dy", 3.5)
    .text("Deaths");

  const bubWidth = bubbleLegend.node().getBoundingClientRect().width;
  const bubStart = mapWidth * 0.8 - bubWidth + radiusScale.range()[1];

  bubbleLegend.attr("transform", `translate(${bubStart},${bubMargin.top})`);

  //--------------------------
  // DRAW FUNCTIONS
  //--------------------------

  function bars(svg) {
    let bar = svg
      .append("g")
      .attr("fill-opacity", fillOpacity)
      .selectAll("rect");

    return ([date, data], transition) =>
      (bar = bar
        .data(data.slice(0, n), (d) => d.name)
        .join(
          (enter) =>
            enter
              .append("rect")
              .attr("height", y.bandwidth())
              .attr("x", x(0))
              .attr("y", (d) =>
                collapsed === true
                  ? y((prev.get(d) || d).rank)
                  : y((prev.get(d) || d).rankLong),
              )
              .attr("width", (d) => x((prev.get(d) || d).value) - x(0))
              .attr("fill", (d) =>
                colorScale(d.value / fipsLookup[d.name].pop),
              ),
          (update) => update,
          (exit) =>
            exit
              .transition(transition)
              .remove()
              .attr("y", (d) =>
                collapsed === true
                  ? y((next.get(d) || d).rank)
                  : y((next.get(d) || d).rankLong),
              )
              .attr("width", (d) => x((next.get(d) || d).value) - x(0)),
        )
        .call((bar) =>
          bar
            .transition(transition)
            .attr("y", (d) => (collapsed === true ? y(d.rank) : y(d.rankLong)))
            .attr("width", (d) => x(d.value) - x(0))
            .attr("fill", (d) => colorScale(d.value / fipsLookup[d.name].pop)),
        ));
  }

  function deathBars(svg) {
    let bar = svg.append("g").attr("fill-opacity", 0.75).selectAll("rect");

    return ([date, data], transition) =>
      (bar = bar
        .data(data.slice(0, n), (d) => d.name)
        .join(
          (enter) =>
            enter
              .append("rect")
              .attr("height", y.bandwidth())
              .attr("x", x(0))
              .attr("y", (d) =>
                collapsed === true
                  ? y((prev.get(d) || d).rank)
                  : y((prev.get(d) || d).rankLong),
              )
              .attr("width", (d) => x((prev.get(d) || d).deaths) - x(0))
              .attr("fill", "black"),
          (update) => update,
          (exit) =>
            exit
              .transition(transition)
              .remove()
              .attr("y", (d) =>
                collapsed === true
                  ? y((prev.get(d) || d).rank)
                  : y((prev.get(d) || d).rankLong),
              )
              .attr("width", (d) => x((next.get(d) || d).deaths) - x(0)),
        )
        .call((bar) =>
          bar
            .transition(transition)
            .attr("y", (d) => (collapsed === true ? y(d.rank) : y(d.rankLong)))
            .attr("width", (d) => x(d.deaths) - x(0)),
        )
        .attr("fill", "black"));
  }

  function textTween(a, b) {
    const i = d3.interpolateNumber(a, b);
    return function (t) {
      this.textContent = formatNumber(i(t));
    };
  }

  function percTween(a, b) {
    const i = d3.interpolateNumber(a, b);
    return function (t) {
      this.textContent = formatPerc(i(t));
    };
  }

  function labels(svg) {
    let label = svg
      .append("g")
      .style("font", "bold 12px var(--sans-serif)")
      .style("font-variant-numeric", "tabular-nums")
      .attr("text-anchor", "end")
      .selectAll("text");

    return ([date, data], transition) =>
      (label = label
        .data(data.slice(0, n), (d) => d.name)
        .join(
          (enter) =>
            enter
              .append("text")
              .attr("transform", (d) => {
                const prevY = collapsed
                  ? (prev.get(d) || d).rank
                  : (prev.get(d) || d).rankLong;
                return `translate(${x((prev.get(d) || d).value)},${y(prevY)})`;
              })
              .attr("y", y.bandwidth() / 2)
              .attr("x", -6)
              .attr("dy", "-0.25em")
              .attr("font-weight", "600")
              .text((d) => (d.value ? d.name : "")),
          (update) => update,
          (exit) =>
            exit
              .transition(transition)
              .remove()
              .attr("transform", (d) => {
                const nextY = collapsed
                  ? (next.get(d) || d).rank
                  : (next.get(d) || d).rankLong;
                return `translate(${x((next.get(d) || d).value)},${y(nextY)})`;
              }),
        )
        .call((bar) =>
          bar
            .transition(transition)
            .text((d) => (d.value ? d.name : ""))
            .attr("transform", function (d) {
              const wordWidth = this.getBoundingClientRect().width;
              let xTranslation;
              if (
                x(d.value) >
                wordWidth + labelPadding * 2 + x(d.deaths) - deathPadding
              ) {
                xTranslation = x(d.value);
              } else {
                xTranslation =
                  wordWidth + labelPadding * 2 + x(d.deaths) - deathPadding;
              }
              const prevY = collapsed ? d.rank : d.rankLong;
              return `translate(${xTranslation},${y(prevY)})`;
            }),
        ));
  }

  function countLabels(svg) {
    let label = svg
      .append("g")
      .style("font-variant-numeric", "tabular-nums")
      .selectAll("g");

    return ([date, data], transition) =>
      (label = label
        .data(data.slice(0, n), (d) => d.name)
        .join(
          (enter) =>
            enter
              .append("g")
              .call((gCount) => {
                gCount
                  .append("rect")
                  .attr("fill-opacity", 0.75)
                  .attr("width", 0)
                  .attr("height", y.bandwidth() / 2 - deathPadding * 2)
                  .attr("x", labelPadding - deathPadding)
                  .attr("y", y.bandwidth() / 2 + deathPadding)
                  .attr("rx", 3);
              })
              .call((gCount) =>
                gCount
                  .append("text")
                  .attr("y", y.bandwidth() / 2)
                  .attr("x", labelPadding)
                  .attr("dy", "1.05em")
                  .call((text) => {
                    text.append("tspan").attr("class", "tdeath");
                    text
                      .append("tspan")
                      .attr("class", "tval")
                      .attr("x", function (d) {
                        return x((prev.get(d) || d).value) > labelPadding * 10
                          ? x((prev.get(d) || d).value) - labelPadding * 10
                          : -labelPadding * 10;
                      });
                    text
                      .append("tspan")
                      .attr("class", "tparens one")
                      .style("fill", "#303030")
                      .text((d) => (d.value ? " (" : ""));
                    text.append("tspan").attr("class", "tperc");
                    text
                      .append("tspan")
                      .attr("class", "tparens two")
                      .style("fill", "#303030")
                      .text((d) => (d.value ? ")" : ""));
                  }),
              )
              .attr(
                "transform",
                (d) =>
                  `translate(${x(d.deaths)},${y(
                    collapsed
                      ? (prev.get(d) || d).rank
                      : (next.get(d) || d).rankLong,
                  )})`,
              ),
          (update) => update,
          (exit) =>
            exit
              .transition(transition)
              .remove()
              .attr("transform", function (d) {
                const nextY = collapsed
                  ? (next.get(d) || d).rank
                  : (next.get(d) || d).rankLong;
                const nextX =
                  x((next.get(d) || d).value) -
                  this.childNodes[1].getComputedTextLength() -
                  labelPadding;
                return `translate(${nextX},${y(nextY)})`;
              })
              .call(function (g) {
                g.select(".tdeath").tween("text", (d) =>
                  textTween(d.deaths, (next.get(d) || d).deaths),
                );
                g.select(".tval").tween("text", (d) =>
                  textTween(d.value, (next.get(d) || d).value),
                );
              }),
        )

        .call(function (g) {
          g.transition(transition)
            .attr(
              "transform",
              (d) =>
                `translate(${x(d.deaths)},${y(collapsed ? d.rank : d.rankLong)})`,
            )

            .call(function (gTrans) {
              gTrans
                .select(".tdeath")
                .style("fill", (d) => (d.deaths ? "white" : "none"))
                .tween("text", (d) =>
                  textTween((prev.get(d) || d).deaths, d.deaths),
                );

              gTrans
                .select(".tval")
                .attr("x", function (d) {
                  const children = this.parentNode.childNodes;
                  const deathCountW = measureText(
                    formatNumber(d.deaths).toString(),
                    12,
                  );
                  const totWidth =
                    measureText(formatNumber(d.value).toString(), 14) +
                    children[3].getComputedTextLength() +
                    x(d.deaths) +
                    11.326171875;

                  if (this.getComputedTextLength()) {
                    // float left if bar narrower than label
                    if (
                      x(d.value) <
                      totWidth + deathCountW + labelPadding * 3
                    ) {
                      // if no deaths
                      if (!d.deaths) {
                        // if no confirmed
                        if (!d.value) {
                          // tuck label to left of bar in preparation for first transition
                          return -labelPadding * 10;

                          // if confirmed, but no deaths...
                        } else {
                          // float it just to the right of 0
                          return labelPadding;
                        }
                      } else {
                        // float just to the right of death label
                        return deathCountW + labelPadding * 2;
                      }

                      // float right if bar wider than label
                    } else {
                      return x(d.value) - totWidth - labelPadding;
                    }

                    // if no width for tval...
                  } else {
                    if (!d.value) {
                      return x(d.value) > labelPadding * 10
                        ? x(d.value) - labelPadding * 10
                        : -labelPadding * 10;
                    } else {
                      if (
                        x(d.value) >
                        totWidth + deathCountW + labelPadding * 3
                      ) {
                        return x(d.value) - labelPadding * 10;
                      } else {
                        if (!d.deaths) {
                          return labelPadding;
                        } else {
                          return deathCountW + labelPadding * 2;
                        }
                      }
                    }
                  }
                })
                .style("fill", (d) => (d.value ? "black" : "none"))
                .tween("text", (d) =>
                  textTween((prev.get(d) || d).value, d.value),
                );

              gTrans
                .select(".tperc")
                .style("fill", (d) => (d.value ? "#303030" : "none"))
                .tween("text", (d) => {
                  return percTween(
                    (prev.get(d) || d).value / fipsLookup[d.name].pop,
                    d.value / fipsLookup[d.name].pop,
                  );
                });

              gTrans.select(".tparens.one").text((d) => (d.value ? " (" : ""));
              gTrans.select(".tparens.two").text((d) => (d.value ? ")" : ""));
              gTrans
                .select("rect")
                .style("fill", (d) => (d.deaths ? "black" : "none"))
                .attr("width", function (d) {
                  return (
                    measureText(formatNumber(d.deaths).toString(), 12) +
                    deathPadding * 2
                  );
                });
            });
        }));
  }

  function axis(svg) {
    const g = svg
      .append("g")
      .attr("transform", `translate(0,${barChartMargin.top})`);

    axisTop.tickSizeOuter(0).tickSizeInner(-barSize * (n + y.padding()));

    return (_, transition, topBarValue) => {
      const numOfTicks =
        Math.floor(topBarValue) < maxTickNum
          ? Math.floor(topBarValue)
          : maxTickNum;
      axisTop.ticks(numOfTicks);

      g.transition(transition).call(axisTop);
      g.select(".tick:first-of-type text").remove();
      g.selectAll("line").attr("stroke", "white");
      g.selectAll(".tick:first-of-type line").attr("stroke", "none");
      g.select(".domain").remove();
    };
  }

  function ticker(svg) {
    const now = svg
      .append("g")
      .append("text")
      .attr(
        "transform",
        `translate(${mapWidth * 0.68},${mapHeight * 0.97 + mapMargin.top})`,
      )
      .style("font", `bold ${barSize}px var(--sans-serif)`)
      .style("font-variant-numeric", "tabular-nums")
      .style("text-anchor", "middle")
      .style("font-size", `${d3.min([mapWidth / 20, 32])}px`)
      .text(formatDate(keyframes[0][0]));

    return ([date], transition) => {
      now.text(formatDate(date));
    };
  }

  function circles(svg) {
    let circle = svg
      .append("g")
      .attr("transform", `translate(${mapMargin.left},${mapMargin.top})`)
      .attr("fill-opacity", fillOpacity)
      .selectAll("circle");

    return ([date, data], transition) =>
      (circle = circle
        .data(data, (d) => d.name)
        .join(
          (enter) =>
            enter
              .append("circle")
              .attr("fill", (d) => {
                const ratioInfected = d.value / fipsLookup[d.name].pop;
                return colorScale(ratioInfected);
              })
              .attr("r", (d) => radiusScale(d.value))
              .attr("cx", (d) => fipsLookup[d.name].centroid[0])
              .attr("cy", (d) => fipsLookup[d.name].centroid[1]),
          (update) => {
            update.each((d) => {
              // render state borders visible
              if (d.value) {
                d3.select(`.f${fipsLookup[d.name].fips}.hidden`)
                  .classed("hidden", false)
                  .raise()
                  .attr("stroke", "black")
                  .attr("fill", "#d0d0d0")
                  .transition()
                  .duration(650)
                  .attr("stroke", "#d0d0d0")
                  .attr("fill", "whitesmoke");
              } else {
                d3.select(`.f${fipsLookup[d.name].fips}`)
                  .classed("hidden", true)
                  .attr("stroke", "none")
                  .attr("fill", "none");
              }
            });
            return update
              .attr("r", (d) => radiusScale(d.value))
              .attr("fill", (d) => {
                const ratioInfected = d.value / fipsLookup[d.name].pop;
                return colorScale(ratioInfected);
              });
          },
          (exit) => exit,
        ));
  }

  function deathCircles(svg) {
    let circle = svg
      .append("g")
      .attr("transform", `translate(${mapMargin.left},${mapMargin.top})`)
      .attr("fill-opacity", 0.75)
      .selectAll("circle");

    return ([date, data], transition) =>
      (circle = circle
        .data(data, (d) => d.name)
        .join(
          (enter) =>
            enter
              .append("circle")
              .attr("fill", "black")
              .attr("r", (d) => radiusScale(d.deaths))
              .attr("cx", (d) => fipsLookup[d.name].centroid[0])
              .attr("cy", (d) => fipsLookup[d.name].centroid[1]),
          (update) => update.attr("r", (d) => radiusScale(d.deaths)),
          (exit) => exit,
        ));
  }

  //--------------------------
  // ACTUALLY DRAWING THINGS
  //--------------------------

  const updateBars = bars(rightSvg);
  const updateDeathBars = deathBars(rightSvg);
  const updateAxis = axis(rightSvg);
  const updateTicker = ticker(mapSvg);
  const updateLabels = labels(rightSvg);
  const updateCountLabels = countLabels(rightSvg);
  const updateCircles = circles(mapSvg);
  const updateDeathCircles = deathCircles(mapSvg);

  expandCollapse.raise();

  const scrubSelect = d3.select(scrubber).on("input", function () {
    scrub(this);
  });

  function scrub(form) {
    const keyframe = form.value;

    const transition = rightSvg
      .transition()
      .duration(duration)
      .ease(d3.easeLinear);

    const topBarValue = d3.max(keyframe[1].map((d) => d.value));

    x.domain([0, topBarValue]);

    updateAxis(keyframe, transition, topBarValue);
    updateBars(keyframe, transition);
    updateDeathBars(keyframe, transition);
    updateLabels(keyframe, transition);
    updateCountLabels(keyframe, transition);
    updateTicker(keyframe, transition);
    updateCircles(keyframe, transition);
    updateDeathCircles(keyframe, transition);
  }
} // loadData callback
