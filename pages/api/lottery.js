const fs = require('fs');
const path = require('path');

class LotteryManager {
    constructor() {
        this.dataPath = path.join(process.cwd(), 'data', 'lottery.json');
    }

    // Read lottery data from file
    readLotteryData() {
        try {
            const data = fs.readFileSync(this.dataPath, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            return { records: [] };
        }
    }

    // Save lottery data to file
    saveLotteryData(data) {
        fs.writeFileSync(this.dataPath, JSON.stringify(data, null, 2));
    }

    // Check if a date already exists
    dateExists(date) {
        const data = this.readLotteryData();
        return data.records.some(record => record.date === date);
    }

    // Add new lottery record
    addLotteryRecord(record) {
        if (!record.date) {
            throw new Error('Date is required');
        }

        if (this.dateExists(record.date)) {
            throw new Error('A record for this date already exists');
        }

        // Validate the record structure
        if (!record.first || !record.second || !record.third ||
            !Array.isArray(record.specialPrize) || record.specialPrize.length !== 10 ||
            !Array.isArray(record.consolationPrize) || record.consolationPrize.length !== 10) {
            throw new Error('Invalid record structure');
        }

        const data = this.readLotteryData();
        data.records.push(record);
        this.saveLotteryData(data);
        return true;
    }
}

const lotteryManager = new LotteryManager();

export default async function handler(req, res) {
    if (req.method === 'GET') {
        try {
            const data = lotteryManager.readLotteryData();
            res.status(200).json({ success: true, data: data.records });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    } else if (req.method === 'POST') {
        try {
            const record = {
                date: new Date().toISOString().split('T')[0],
                first: req.body.firstPrize,
                second: req.body.secondPrize,
                third: req.body.thirdPrize,
                specialPrize: req.body.specialPrize,
                consolationPrize: req.body.consolationPrize
            };

            lotteryManager.addLotteryRecord(record);
            res.status(200).json({ success: true, message: 'Record added successfully' });
        } catch (error) {
            res.status(400).json({ success: false, error: error.message });
        }
    } else {
        res.status(405).json({ success: false, error: 'Method not allowed' });
    }
} 