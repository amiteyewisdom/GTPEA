import fs from "fs";
import path from "path";

function walk(d, out = []) {
  for (const f of fs.readdirSync(d)) {
    const p = path.join(d, f);
    if (fs.statSync(p).isDirectory()) walk(p, out);
    else if (/\.tsx$/.test(f)) out.push(p);
  }
  return out;
}

for (const p of walk("src")) {
  const lines = fs.readFileSync(p, "utf8").split("\n");
  lines.forEach((l, i) => {
    const t = l.trim();
    if (!/^<(button|Link)\b/.test(t)) return;
    // gather the whole JSX opening tag (until '>')
    let tag = t;
    let j = i;
    while (!tag.includes(">") && j + 1 < lines.length) {
      j++;
      tag += " " + lines[j].trim();
    }
    if (!/onClick|href|type="submit"|formAction|cursor-not-allowed|disabled/.test(tag)) {
      console.log(`${p.replace(/.*src./, "src/")}:${i + 1}  ${tag.slice(0, 110)}`);
    }
  });
}
