import MessageArea from "../../components/messages/MessageArea";
import MessageControl from "../../components/messages/MessageControl";
import MessageHeader from "../../components/messages/MessageHeader";

export default function MessagingPage() {
  return (
    <section className="flex flex-col relative h-[97vh] xs:px-2 sm:container md:!p-0">
      <MessageHeader />
      <MessageArea />
      <MessageControl />
    </section>
  );
}
