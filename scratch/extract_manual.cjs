const fs = require('fs');
const logPath = 'C:\\Users\\Omole\\.gemini\\antigravity\\brain\\7c495d50-f52c-433a-86da-8c150c775e12\\.system_generated\\logs\\overview.txt';
const content = fs.readFileSync(logPath, 'utf8');
const lines = content.split('\n');

for (const line of lines) {
    if (line.includes('"step_index":24')) {
        const data = JSON.parse(line);
        const targetContent = data.tool_calls[0].args.TargetContent;
        console.log(targetContent);
        break;
    }
}
