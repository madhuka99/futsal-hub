/**
 * Generates a styled match card image using Canvas API.
 * Returns a Blob of the PNG image.
 */
export async function generateMatchImage({ match, playersInMatch }) {
  const canvas = document.createElement("canvas");
  const WIDTH = 720;
  const ctx = canvas.getContext("2d");

  // --- Colors ---
  const bg = "#111111";
  const white = "#f5f5f5";
  const muted = "#999999";
  const accent = "#3b82f6";
  const divider = "#2a2a2a";
  const teamBg1 = "#1e293b";
  const teamBg2 = "#1c1917";

  // --- Data ---
  const hasScores = match.team1_score !== null && match.team2_score !== null;
  const team1Players = playersInMatch.filter((p) => p.team_number === 1);
  const team2Players = playersInMatch.filter((p) => p.team_number === 2);
  const hasPlayers = team1Players.length > 0 || team2Players.length > 0;

  const matchDate = new Date(match.date);
  let matchDateTime = new Date(matchDate);
  if (match.startTime) {
    const [h, m, s] = match.startTime.split(":").map(Number);
    matchDateTime.setHours(h || 0, m || 0, s || 0);
  }
  const isUpcoming = matchDateTime > new Date();
  const status = hasScores ? "Finished" : isUpcoming ? "Upcoming" : "Past";

  // --- Load logo ---
  let logo = null;
  try {
    logo = await loadImage("/icons/icon-192x192.png");
  } catch {}

  // --- Pre-calculate content height ---
  // Logo area: 80 (logo) + 16 (gap)
  let contentHeight = 96 + 200; // logo + header/date/time/location
  if (hasScores) contentHeight += 110;
  else if (isUpcoming && !hasPlayers) contentHeight += 140; // CTA section for upcoming without teams
  else contentHeight += 16;
  if (hasPlayers) {
    const teamCardHeight = Math.max(team1Players.length, team2Players.length) * 32 + 56;
    contentHeight += teamCardHeight + 48;
  }
  contentHeight += 50; // Footer

  const HEIGHT = Math.max(contentHeight, 420);
  canvas.width = WIDTH;
  canvas.height = HEIGHT;

  // --- Background ---
  ctx.fillStyle = bg;
  roundRect(ctx, 0, 0, WIDTH, HEIGHT, 24);
  ctx.fill();

  // --- Header accent bar ---
  ctx.fillStyle = accent;
  roundRectTop(ctx, 0, 0, WIDTH, 6, 24);
  ctx.fill();

  // --- Logo ---
  let headerY = 30;
  if (logo) {
    const logoSize = 56;
    ctx.save();
    ctx.beginPath();
    ctx.arc(WIDTH / 2, headerY + logoSize / 2, logoSize / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(logo, WIDTH / 2 - logoSize / 2, headerY, logoSize, logoSize);
    ctx.restore();
    headerY += logoSize + 12;
  }

  // --- App branding ---
  ctx.fillStyle = muted;
  ctx.font = "600 14px -apple-system, BlinkMacSystemFont, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("FUTSALHUB", WIDTH / 2, headerY + 14);
  headerY += 32;

  // --- Title ---
  ctx.fillStyle = white;
  ctx.font = "700 28px -apple-system, BlinkMacSystemFont, sans-serif";
  ctx.fillText("Futsal Match", WIDTH / 2, headerY + 10);
  headerY += 24;

  // --- Status badge ---
  const statusColor =
    status === "Upcoming" ? "#3b82f6" : status === "Finished" ? "#22c55e" : "#6b7280";

  ctx.font = "700 12px -apple-system, BlinkMacSystemFont, sans-serif";
  const statusWidth = ctx.measureText(status.toUpperCase()).width + 24;
  ctx.fillStyle = statusColor + "30";
  roundRect(ctx, WIDTH / 2 - statusWidth / 2, headerY, statusWidth, 28, 14);
  ctx.fill();
  ctx.fillStyle = statusColor;
  ctx.fillText(status.toUpperCase(), WIDTH / 2, headerY + 18);
  headerY += 44;

  // --- Date & Time ---
  const dateStr = matchDate.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const timeStr = match.startTime ? match.startTime.substring(0, 5) : null;

  ctx.fillStyle = white;
  ctx.font = "500 18px -apple-system, BlinkMacSystemFont, sans-serif";
  ctx.fillText(dateStr, WIDTH / 2, headerY);
  headerY += 24;

  if (timeStr) {
    ctx.fillStyle = muted;
    ctx.font = "400 16px -apple-system, BlinkMacSystemFont, sans-serif";
    let timeDisplay = timeStr;
    if (match.endTime) timeDisplay += ` - ${match.endTime.substring(0, 5)}`;
    ctx.fillText(timeDisplay, WIDTH / 2, headerY);
    headerY += 22;
  }

  // --- Location ---
  if (match.location) {
    ctx.fillStyle = muted;
    ctx.font = "400 15px -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.fillText(match.location, WIDTH / 2, headerY);
    headerY += 22;
  }

  // --- Divider ---
  let y = headerY + 10;
  ctx.strokeStyle = divider;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(60, y);
  ctx.lineTo(WIDTH - 60, y);
  ctx.stroke();

  // --- Score section (if available) ---
  if (hasScores) {
    y += 20;
    ctx.fillStyle = muted;
    ctx.font = "600 13px -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("FINAL SCORE", WIDTH / 2, y);

    y += 50;
    ctx.fillStyle = white;
    ctx.font = "700 56px -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.textAlign = "right";
    ctx.fillText(String(match.team1_score), WIDTH / 2 - 40, y);

    ctx.fillStyle = muted;
    ctx.font = "700 36px -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(":", WIDTH / 2, y - 4);

    ctx.fillStyle = white;
    ctx.font = "700 56px -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(String(match.team2_score), WIDTH / 2 + 40, y);

    y += 30;
    ctx.font = "500 14px -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.fillStyle = muted;
    ctx.textAlign = "right";
    ctx.fillText("Team A", WIDTH / 2 - 40, y);
    ctx.textAlign = "left";
    ctx.fillText("Team B", WIDTH / 2 + 40, y);

    ctx.textAlign = "center";
    y += 24;

    ctx.strokeStyle = divider;
    ctx.beginPath();
    ctx.moveTo(60, y);
    ctx.lineTo(WIDTH - 60, y);
    ctx.stroke();
    y += 16;
  } else if (isUpcoming && !hasPlayers) {
    // --- CTA for upcoming matches with no teams ---
    y += 30;

    // Decorative futsal icon (circle)
    ctx.fillStyle = accent + "20";
    roundRect(ctx, WIDTH / 2 - 100, y, 200, 80, 16);
    ctx.fill();

    ctx.fillStyle = white;
    ctx.font = "600 18px -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Game Day!", WIDTH / 2, y + 34);

    ctx.fillStyle = muted;
    ctx.font = "400 14px -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.fillText("Are you ready?", WIDTH / 2, y + 58);

    y += 110;
  } else {
    y += 16;
  }

  // --- Player lists ---
  if (hasPlayers) {
    ctx.fillStyle = muted;
    ctx.font = "600 13px -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("LINEUPS", WIDTH / 2, y + 10);
    y += 32;

    const colWidth = (WIDTH - 100) / 2;
    const col1X = 50;
    const col2X = 50 + colWidth + 8;
    const teamCardHeight = Math.max(team1Players.length, team2Players.length) * 32 + 56;

    ctx.fillStyle = teamBg1;
    roundRect(ctx, col1X, y, colWidth - 4, teamCardHeight, 12);
    ctx.fill();

    ctx.fillStyle = teamBg2;
    roundRect(ctx, col2X, y, colWidth - 4, teamCardHeight, 12);
    ctx.fill();

    ctx.fillStyle = accent;
    ctx.font = "700 14px -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("TEAM A", col1X + colWidth / 2 - 2, y + 28);

    ctx.fillStyle = "#f97316";
    ctx.fillText("TEAM B", col2X + colWidth / 2 - 2, y + 28);

    ctx.font = "400 14px -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.fillStyle = white;
    team1Players.forEach((p, i) => {
      const name = p.player?.full_name || "Unknown";
      ctx.fillText(name, col1X + colWidth / 2 - 2, y + 56 + i * 32);
    });

    team2Players.forEach((p, i) => {
      const name = p.player?.full_name || "Unknown";
      ctx.fillText(name, col2X + colWidth / 2 - 2, y + 56 + i * 32);
    });

    y += teamCardHeight + 16;
  }

  // --- Footer ---
  const footerY = HEIGHT - 28;
  ctx.strokeStyle = divider;
  ctx.beginPath();
  ctx.moveTo(60, footerY - 16);
  ctx.lineTo(WIDTH - 60, footerY - 16);
  ctx.stroke();

  ctx.fillStyle = muted;
  ctx.font = "400 12px -apple-system, BlinkMacSystemFont, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("Shared from FutsalHub", WIDTH / 2, footerY);

  // --- Convert to Blob ---
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), "image/png");
  });
}

// --- Helpers ---
function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

function roundRectTop(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h);
  ctx.lineTo(x, y + h);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}
