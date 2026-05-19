const fs = require('fs');
const logPath = 'C:\\Users\\Omole\\.gemini\\antigravity\\brain\\7c495d50-f52c-433a-86da-8c150c775e12\\.system_generated\\logs\\overview.txt';
const outputPath = 'c:\\Users\\Omole\\Desktop\\Omole\\Websites\\locomotive\\scratch\\original_index.txt';

const content = fs.readFileSync(logPath, 'utf8');
const lines = content.split('\n');

for (const line of lines) {
    if (!line.trim()) continue;
    try {
        const json = JSON.parse(line);
        if (json.step_index === 24) {
            const tool_calls = json.tool_calls;
            for (const call of tool_calls) {
                if (call.name === 'replace_file_content' && call.args.TargetFile.includes('Index.tsx')) {
                    fs.writeFileSync(outputPath, JSON.parse('"' + call.args.TargetContent + '"'));
                    console.log('Original Index.tsx extracted to ' + outputPath);
                }
            }
        }
    } catch (e) {
        // console.error(e);
    }
}
