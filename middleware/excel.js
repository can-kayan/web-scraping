const fs = require("fs");
const path = require("path");
const XLSX = require("xlsx");
const { flatten } = require("flat");
function asianGroup(folderName) {
  const fileName = "asianHandicap.json";
  const folderPath = path.join(__dirname, "../data", folderName);
  const jsonAsianPath = path.join(folderPath, fileName);

  if (!fs.existsSync(jsonAsianPath)) {
    console.error("Dosya bulunamadı:", jsonAsianPath);
    return null;
  }

  try {
    const fileContent = fs.readFileSync(jsonAsianPath, "utf-8");
    const data = JSON.parse(fileContent);
    if (!data || data.length == 0) return null;
    const group = data.reduce((acc, item) => {
      const key = item.name.toUpperCase();
      if (item.fullTime) {
        item.fullTime = sortScores(item.fullTime);
      }
      if (item.oneHalf) {
        item.oneHalf = sortScores(item.oneHalf);
      }
      if (item.twoHalf) {
        item.twoHalf = sortScores(item.twoHalf);
      }
      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
    }, {});

    return group;
  } catch (err) {
    console.error("JSON okuma/parsing hatası:", err.message);
    return null;
  }
}

function bothTeamsGroup(folderName) {
  const fileName = "bothTeamsToScore.json";
  const folderPath = path.join(__dirname, "../data", folderName);
  const jsonAsianPath = path.join(folderPath, fileName);

  if (!fs.existsSync(jsonAsianPath)) {
    console.error("Dosya bulunamadı:", jsonAsianPath);
    return null;
  }

  try {
    const fileContent = fs.readFileSync(jsonAsianPath, "utf-8");
    const data = JSON.parse(fileContent);
    if (!data || data.length == 0) return null;
    const group = data.reduce((acc, item) => {
      const key = item.name.toUpperCase();
      if (!acc[key.toUpperCase()]) acc[key] = [];
      acc[key].push(item);
      return acc;
    }, {});

    return group;
  } catch (err) {
    console.error("JSON okuma/parsing hatası:", err.message);
    return null;
  }
}
function sortScores(scoreObj) {
  if (!scoreObj || typeof scoreObj !== "object") {
    console.warn("Geçersiz skor objesi:", scoreObj);
    return {};
  }

  return Object.entries(scoreObj)
    .sort(([scoreA], [scoreB]) => {
      const [a1, a2] = scoreA.split(":").map(Number);
      const [b1, b2] = scoreB.split(":").map(Number);
      if (a1 !== b1) return a1 - b1;
      return a2 - b2;
    })
    .reduce((acc, [key, value]) => {
      acc[key] = value;
      return acc;
    }, {});
}

function correctGroup(folderName) {
  const fileName = "correctScore.json";
  const folderPath = path.join(__dirname, "../data", folderName);
  const jsonAsianPath = path.join(folderPath, fileName);

  if (!fs.existsSync(jsonAsianPath)) {
    console.error("Dosya bulunamadı:", jsonAsianPath);
    return null;
  }

  try {
    const fileContent = fs.readFileSync(jsonAsianPath, "utf-8");
    const data = JSON.parse(fileContent);
    if (!data || data.length == 0) return null;
    const group = data.reduce((acc, item) => {
      const key = item.name.toUpperCase();
      if (item.fullTime) {
        item.fullTime = sortScores(item.fullTime);
      }
      if (item.oneHalf) {
        item.oneHalf = sortScores(item.oneHalf);
      }
      if (item.twoHalf) {
        item.twoHalf = sortScores(item.twoHalf);
      }
      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
    }, {});

    return group;
  } catch (err) {
    console.error("JSON okuma/parsing hatası:", err.message);
    return null;
  }
}

function doubleGroup(folderName) {
  const fileName = "doubleChange.json";
  const folderPath = path.join(__dirname, "../data", folderName);
  const jsonAsianPath = path.join(folderPath, fileName);

  if (!fs.existsSync(jsonAsianPath)) {
    console.error("Dosya bulunamadı:", jsonAsianPath);
    return null;
  }

  try {
    const fileContent = fs.readFileSync(jsonAsianPath, "utf-8");
    const data = JSON.parse(fileContent);
    if (!data || data.length == 0) return null;
    const group = data.reduce((acc, item) => {
      const key = item.name.toUpperCase();
      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
    }, {});

    return group;
  } catch (err) {
    console.error("JSON okuma/parsing hatası:", err.message);
    return null;
  }
}

function drawGroup(folderName) {
  const fileName = "drawNoBet.json";
  const folderPath = path.join(__dirname, "../data", folderName);
  const jsonAsianPath = path.join(folderPath, fileName);

  if (!fs.existsSync(jsonAsianPath)) {
    console.error("Dosya bulunamadı:", jsonAsianPath);
    return null;
  }

  try {
    const fileContent = fs.readFileSync(jsonAsianPath, "utf-8");
    const data = JSON.parse(fileContent);
    if (!data || data.length == 0) return null;
    const group = data.reduce((acc, item) => {
      const key = item.name.toUpperCase();
      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
    }, {});

    return group;
  } catch (err) {
    console.error("JSON okuma/parsing hatası:", err.message);
    return null;
  }
}

function europeanGroup(folderName) {
  const fileName = "europeanHandicap.json";
  const folderPath = path.join(__dirname, "../data", folderName);
  const jsonAsianPath = path.join(folderPath, fileName);

  if (!fs.existsSync(jsonAsianPath)) {
    console.error("Dosya bulunamadı:", jsonAsianPath);
    return null;
  }

  try {
    const fileContent = fs.readFileSync(jsonAsianPath, "utf-8");
    const data = JSON.parse(fileContent);
    if (!data || data.length == 0) return null;
    const group = data.reduce((acc, item) => {
      const key = item.name.toUpperCase();
      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
    }, {});

    return group;
  } catch (err) {
    console.error("JSON okuma/parsing hatası:", err.message);
    return null;
  }
}
function halfFullGroup(folderName) {
  const fileName = "halfFulltime.json";
  const folderPath = path.join(__dirname, "../data", folderName);
  const jsonAsianPath = path.join(folderPath, fileName);

  if (!fs.existsSync(jsonAsianPath)) {
    console.error("Dosya bulunamadı:", jsonAsianPath);
    return null;
  }

  try {
    const fileContent = fs.readFileSync(jsonAsianPath, "utf-8");
    const data = JSON.parse(fileContent);
    if (!data || data.length == 0) return null;
    const group = data.reduce((acc, item) => {
      const key = item.name.toUpperCase();
      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
    }, {});

    return group;
  } catch (err) {
    console.error("JSON okuma/parsing hatası:", err.message);
    return null;
  }
}

function oddOrEvenGroup(folderName) {
  const fileName = "oddOrEven.json";
  const folderPath = path.join(__dirname, "../data", folderName);
  const jsonAsianPath = path.join(folderPath, fileName);

  if (!fs.existsSync(jsonAsianPath)) {
    console.error("Dosya bulunamadı:", jsonAsianPath);
    return null;
  }

  try {
    const fileContent = fs.readFileSync(jsonAsianPath, "utf-8");
    const data = JSON.parse(fileContent);
    if (!data || data.length == 0) return null;
    const group = data.reduce((acc, item) => {
      const key = item.name.toUpperCase();
      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
    }, {});

    return group;
  } catch (err) {
    console.error("JSON okuma/parsing hatası:", err.message);
    return null;
  }
}

function oneXtwoGroup(folderName) {
  const fileName = "oneXtwo.json";
  const folderPath = path.join(__dirname, "../data", folderName);
  const jsonAsianPath = path.join(folderPath, fileName);

  if (!fs.existsSync(jsonAsianPath)) {
    console.error("Dosya bulunamadı:", jsonAsianPath);
    return null;
  }

  try {
    const fileContent = fs.readFileSync(jsonAsianPath, "utf-8");
    const data = JSON.parse(fileContent);
    if (!data || data.length == 0) return null;
    const group = data.reduce((acc, item) => {
      const key = item.name.toUpperCase();
      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
    }, {});

    return group;
  } catch (err) {
    console.error("JSON okuma/parsing hatası:", err.message);
    return null;
  }
}

function overUnderGroup(folderName) {
  const fileName = "overUnder.json";
  const folderPath = path.join(__dirname, "../data", folderName);
  const jsonAsianPath = path.join(folderPath, fileName);

  if (!fs.existsSync(jsonAsianPath)) {
    console.error("Dosya bulunamadı:", jsonAsianPath);
    return null;
  }

  try {
    const fileContent = fs.readFileSync(jsonAsianPath, "utf-8");
    const data = JSON.parse(fileContent);
    if (!data || data.length == 0) return null;
    const group = data.reduce((acc, item) => {
      const key = item.name.toUpperCase();
      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
    }, {});

    return group;
  } catch (err) {
    console.error("JSON okuma/parsing hatası:", err.message);
    return null;
  }
}
function matchResultGroup(folderName) {
  const fileName = "match_info.json";
  const folderPath = path.join(__dirname, "../data", folderName);
  const jsonAsianPath = path.join(folderPath, fileName);

  if (!fs.existsSync(jsonAsianPath)) {
    console.error("Dosya bulunamadı:", jsonAsianPath);
    return null;
  }

  try {
    const fileContent = fs.readFileSync(jsonAsianPath, "utf-8");
    const data = JSON.parse(fileContent);
    const filteredMatches = data.map((match) => ({
      url: match.url,
      matchResult: match.matchResult,
    }));

    return filteredMatches;
  } catch (err) {
    console.error("JSON okuma/parsing hatası:", err.message);
    return null;
  }
}
function matchInfoGroup(folderName) {
  const fileName = "match_info.json";
  const folderPath = path.join(__dirname, "../data", folderName);
  const jsonAsianPath = path.join(folderPath, fileName);

  if (!fs.existsSync(jsonAsianPath)) {
    console.error("Dosya bulunamadı:", jsonAsianPath);
    return null;
  }

  try {
    const fileContent = fs.readFileSync(jsonAsianPath, "utf-8");
    const data = JSON.parse(fileContent);
    const filteredMatches = data.map((match) => ({
      url: match.url,
      matchInfo: match.teamInfo,
    }));

    return filteredMatches;
  } catch (err) {
    console.error("JSON okuma/parsing hatası:", err.message);
    return null;
  }
}

function normalizeName(name) {
  return name
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .replace(/(COM|US|UK|NET|IO)$/, "");
}

function enrichAndGroupByBookmaker(groupFunctions, matchInfo, matchResult) {
  const matchInfoMap = Object.fromEntries(
    matchInfo.map((i) => [i.url, i.matchInfo])
  );
  const matchResultMap = Object.fromEntries(
    matchResult.map((r) => [r.url, r.matchResult])
  );

  const result = {};

  for (const [groupType, bookmakerGroups] of Object.entries(groupFunctions)) {
    if (!bookmakerGroups) continue;

    for (const [bookmaker, items] of Object.entries(bookmakerGroups)) {
      if (!Array.isArray(items)) continue;

      const normalizedBookmaker = normalizeName(bookmaker); // ✅ Normalize et

      if (!result[normalizedBookmaker]) result[normalizedBookmaker] = [];

      for (const item of items) {
        const { url } = item;

        let existing = result[normalizedBookmaker].find((e) => e.url === url);
        if (!existing) {
          existing = {
            url,
            matchInfo: matchInfoMap[url] || null,
            matchResult: matchResultMap[url] || null,
          };
          result[normalizedBookmaker].push(existing);
        }

        existing[groupType] = item;
      }
    }
  }

  for (const key in result) {
    result[key].forEach((entry) => {
      if (entry.originalBookmakers) {
        entry.originalBookmakers = Array.from(entry.originalBookmakers);
      }
    });
  }

  return result;
}

const xlsx = require("xlsx");

function exportData(data, folderName, fileName) {
  const outputDir = path.join(__dirname, "..", "excel", folderName);
  const outputPath = path.join(outputDir, `${fileName}.xlsx`);

  const sectionOrder = [
    "matchResult",
    "matchInfo",
    "oneXtwo",
    "overUnder",
    "asian",
    "bothTeams",
    "double",
    "european",
    "draw",
    "halfFull",
    "oddOrEven",
    "correct",
  ];

  const flatData = data.map((item) => flatten(item));

  const allKeysSet = new Set();
  flatData.forEach((item) => {
    Object.keys(item).forEach((key) => allKeysSet.add(key));
  });

  const sortedKeys = [];

  for (const section of sectionOrder) {
    let sectionKeys = Array.from(allKeysSet).filter((key) =>
      key.startsWith(section + ".")
    );

    // ✳️ matchResult ve matchInfo sıralanmasın
    if (section !== "matchInfo" && section !== "matchResult") {
      sectionKeys.sort(); // Diğerleri alfabetik sıralanır
    }

    sortedKeys.push(...sectionKeys);
  }

  const formattedData = flatData.map((item) => {
    const row = {};
    for (const key of sortedKeys) {
      const displayKey = key.replace(/\./g, " / ");
      row[displayKey] = item[key] !== undefined ? item[key] : "";
    }
    return row;
  });

  const ws = xlsx.utils.json_to_sheet(formattedData);
  const wb = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(wb, ws, "Sheet1");

  const columns = sortedKeys.map((key) => ({
    wch: Math.min(Math.max(key.length + 5, 10), 50),
  }));
  ws["!cols"] = columns;

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  xlsx.writeFile(wb, outputPath);
} 
function removeUrlAndNameFields(obj) {
  if (Array.isArray(obj)) {
    return obj.map(removeUrlAndNameFields);
  } else if (obj !== null && typeof obj === "object") {
    const cleaned = {};
    for (const key in obj) {
      if (
        key === "url" ||
        key === "name" ||
        key === "openDate" ||
        key === "closeDate" ||
        key === "positionHint"
      )
        continue;
      cleaned[key] = removeUrlAndNameFields(obj[key]);
    }
    return cleaned;
  }
  return obj;
}

function exportXlsx(folderName) {
  const matchInfoGroups = matchInfoGroup(folderName);

  const matchResultGroups = matchResultGroup(folderName);
  const groupFunctions = {
    oneXtwo: oneXtwoGroup(folderName),
    overUnder: overUnderGroup(folderName),
    asian: asianGroup(folderName),
    bothTeams: bothTeamsGroup(folderName),
    double: doubleGroup(folderName),
    european: europeanGroup(folderName),
    draw: drawGroup(folderName),
    halfFull: halfFullGroup(folderName),
    oddOrEven: oddOrEvenGroup(folderName),
    correct: correctGroup(folderName),
  };
  const joins = enrichAndGroupByBookmaker(
    groupFunctions,
    matchInfoGroups,
    matchResultGroups
  );
  // console.log(JSON.stringify(joins["BET365"]));

  if (joins["BET365"])
    exportData(removeUrlAndNameFields(joins["BET365"]), folderName, "BET365");
  if (joins["1XBET"])
    exportData(removeUrlAndNameFields(joins["1XBET"]), folderName, "1XBET");
  if (joins["PINNACLE"])
    exportData(
      removeUrlAndNameFields(joins["PINNACLE"]),
      folderName,
      "PINNACLE"
    );
  if (joins["UNIBET"])
    exportData(removeUrlAndNameFields(joins["UNIBET"]), folderName, "UNIBET");
  if (joins["BETFAIR"])
    exportData(removeUrlAndNameFields(joins["BETFAIR"]), folderName, "BETFAIR");
  if (joins["WILLIAM"])
    exportData(removeUrlAndNameFields(joins["WILLIAM"]), folderName, "WILLIAM");

  return;
}

module.exports = {
  exportXlsx,
};
