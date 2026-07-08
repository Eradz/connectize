import { Radio } from "lucide-react";
import { cloneElement, useState } from "react";
import { ButtonWithTooltipIcon } from "./ButtonWithTooltipIcon";
import PingModal from "./PingModal";

/**
 * Reusable Ping control: a radio-broadcast icon button that opens the ping
 * composer for the given object. Renders nothing unless `show` is true (the
 * caller decides visibility, typically "current user owns/represents the
 * owning company"). The backend still enforces ownership on submit.
 *
 * Pass a custom trigger element as `children` to match a page's own button
 * styling; otherwise a default radio-broadcast icon button is rendered.
 */
export default function PingButton({
  objectType,
  objectId,
  show = true,
  children,
  text,
  tip = "Ping",
  className,
  iconClassName,
}) {
  const [open, setOpen] = useState(false);

  if (!show || !objectId) return null;

  const openModal = () => setOpen(true);

  return (
    <>
      {children ? (
        cloneElement(children, {
          onClick: (e) => {
            children.props.onClick?.(e);
            openModal();
          },
        })
      ) : (
        <ButtonWithTooltipIcon
          IconName={Radio}
          text={text}
          tip={tip}
          className={className}
          iconClassName={iconClassName}
          onClick={openModal}
        />
      )}
      <PingModal
        isOpen={open}
        onClose={() => setOpen(false)}
        objectType={objectType}
        objectId={objectId}
      />
    </>
  );
}
