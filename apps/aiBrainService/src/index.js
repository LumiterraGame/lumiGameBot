const { aiBrainServiceModule } = require("./service");
const { aiBrainPolicyStateModule } = require("./policyState");
const { aiBrainDecisionJournalModule } = require("./decisionJournal");
const { aiBrainPnlLedgerModule } = require("./pnlLedger");
const { aiBrainMemoryModule } = require("./memory");
const { aiBrainSessionModule } = require("./session");

module.exports = {
  aiBrainServiceModule,
  aiBrainPolicyStateModule,
  aiBrainDecisionJournalModule,
  aiBrainPnlLedgerModule,
  aiBrainMemoryModule,
  aiBrainSessionModule
};

console.log("aiBrainService scaffold is ready. Runtime implementation is pending.");
