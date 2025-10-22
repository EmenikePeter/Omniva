// Regex patterns for popular banks
module.exports = [
  {
    name: 'GTBank',
    regex: /Credit: NGN ([\d,\.]+) from ([\w\s\.]+)\. Date: ([\w\-]+)\./i,
    parse: (body) => {
      const m = body.match(/Credit: NGN ([\d,\.]+) from ([\w\s\.]+)\. Date: ([\w\-]+)\./i);
      if (!m) return null;
      return { type: 'credit', amount: m[1].replace(/,/g, ''), description: m[2], date: m[3] };
    }
  },
  {
    name: 'Access Bank',
    regex: /Debit: NGN ([\d,\.]+) at ([\w\s]+)\. Date: ([\w\-]+)\./i,
    parse: (body) => {
      const m = body.match(/Debit: NGN ([\d,\.]+) at ([\w\s]+)\. Date: ([\w\-]+)\./i);
      if (!m) return null;
      return { type: 'debit', amount: m[1].replace(/,/g, ''), description: m[2], date: m[3] };
    }
  },
  {
    name: 'Zenith Bank',
    regex: /Credit Alert: NGN ([\d,\.]+) Desc: ([\w\s]+) Date: ([\w\-]+)\./i,
    parse: (body) => {
      const m = body.match(/Credit Alert: NGN ([\d,\.]+) Desc: ([\w\s]+) Date: ([\w\-]+)\./i);
      if (!m) return null;
      return { type: 'credit', amount: m[1].replace(/,/g, ''), description: m[2], date: m[3] };
    }
  },
  {
    name: 'UBA',
    regex: /Debit Alert: NGN ([\d,\.]+) Desc: ([\w\s]+) Date: ([\w\-]+)\./i,
    parse: (body) => {
      const m = body.match(/Debit Alert: NGN ([\d,\.]+) Desc: ([\w\s]+) Date: ([\w\-]+)\./i);
      if (!m) return null;
      return { type: 'debit', amount: m[1].replace(/,/g, ''), description: m[2], date: m[3] };
    }
  },
  {
    name: 'HDFC',
    regex: /INR ([\d,\.]+) credited\. Desc: ([\w\s]+) Date: ([\d\-A-Za-z]+)\./i,
    parse: (body) => {
      const m = body.match(/INR ([\d,\.]+) credited\. Desc: ([\w\s]+) Date: ([\d\-A-Za-z]+)\./i);
      if (!m) return null;
      return { type: 'credit', amount: m[1].replace(/,/g, ''), description: m[2], date: m[3] };
    }
  },
  {
    name: 'SBI',
    regex: /INR ([\d,\.]+) debited\. Desc: ([\w\s]+) Date: ([\d\-A-Za-z]+)\./i,
    parse: (body) => {
      const m = body.match(/INR ([\d,\.]+) debited\. Desc: ([\w\s]+) Date: ([\d\-A-Za-z]+)\./i);
      if (!m) return null;
      return { type: 'debit', amount: m[1].replace(/,/g, ''), description: m[2], date: m[3] };
    }
  },
  {
    name: 'Standard Bank',
    regex: /Deposit: ZAR ([\d,\.]+) Desc: ([\w\s]+) Date: ([\d\/]+)\./i,
    parse: (body) => {
      const m = body.match(/Deposit: ZAR ([\d,\.]+) Desc: ([\w\s]+) Date: ([\d\/]+)\./i);
      if (!m) return null;
      return { type: 'credit', amount: m[1].replace(/,/g, ''), description: m[2], date: m[3] };
    }
  },
];
