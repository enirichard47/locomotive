const fs = require('fs');
const logPath = 'C:\\Users\\Omole\\.gemini\\antigravity\\brain\\7c495d50-f52c-433a-86da-8c150c775e12\\.system_generated\\logs\\overview.txt';
const content = fs.readFileSync(logPath, 'utf8');
const lines = content.split('\n');

for (const line of lines) {
    if (line.includes('"step_index":24')) {
        try {
            const data = JSON.parse(line);
            const targetContent = data.tool_calls[0].args.TargetContent;
            fs.writeFileSync('scratch/original_index_utf8.tsx', targetContent, 'utf8');
            console.log('Extracted to scratch/original_index_utf8.tsx');
        } catch (e) {
            console.error('Error parsing line:', e);
        }
        break;
    }
}
