import { ContactQuality } from "./ContactQuality";
import { ContactSummary } from "./ContactSummary";
import { ConversationSummary } from "./ConversationSummary";
import { DailyContactActivity } from "./DailyContactActivity";
import { DailyMessageActivity } from "./DailyMessageActivity";
import { MessageSummary } from "./MessageSummary";

export interface DashboardSummary {

  contacts: ContactSummary;

  messages: MessageSummary;

  messageActivity: DailyMessageActivity[];

  contactQuality: ContactQuality;

  conversations: ConversationSummary;

  contactActivity: DailyContactActivity[];
}