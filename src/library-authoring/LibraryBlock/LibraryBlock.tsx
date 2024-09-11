/* eslint-disable react/require-default-props */
import React, { useEffect, useRef, useState } from 'react';
import { getConfig } from '@edx/frontend-platform';

interface LibraryBlockProps {
  onBlockNotification?: (event: { eventType: string; [key: string]: any }) => void;
  usageKey: string;
}
/**
 * React component that displays an XBlock in a sandboxed IFrame.
 *
 * The IFrame is resized responsively so that it fits the content height.
 *
 * We use an IFrame so that the XBlock code, including user-authored HTML,
 * cannot access things like the user's cookies, nor can it make GET/POST
 * requests as the user. However, it is allowed to call any XBlock handlers.
 */
const LibraryBlock = ({ onBlockNotification, usageKey }: LibraryBlockProps) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [iFrameHeight, setIFrameHeight] = useState(600);
  const lmsBaseUrl = getConfig().LMS_BASE_URL;

  /**
   * Handle any messages we receive from the XBlock Runtime code in the IFrame.
   * See wrap.ts to see the code that sends these messages.
   */
  /* istanbul ignore next */
  const receivedWindowMessage = async (event) => {
    if (!iframeRef.current || event.source !== iframeRef.current.contentWindow) {
      return; // This is some other random message.
    }

    const { method, replyKey, ...args } = event.data;
    // const frame = iframeRef.current.contentWindow;
    // const sendReply = async (data) => {
    //   frame?.postMessage({ ...data, replyKey }, '*');
    // };

    if (method === 'update_frame_height') {
      setIFrameHeight(args.height);
    } else if (method?.indexOf('xblock:') === 0) {
      // This is a notification from the XBlock's frontend via 'runtime.notify(event, args)'
      if (onBlockNotification) {
        onBlockNotification({
          eventType: method.substr(7), // Remove the 'xblock:' prefix that we added in wrap.ts
          ...args,
        });
      }
    }
  };

  /**
   * Load the XBlock data from the LMS and then inject it into our IFrame.
   */
  useEffect(() => {
    // Prepare to receive messages from the IFrame.
    // Messages are the only way that the code in the IFrame can communicate
    // with the surrounding UI.
    window.addEventListener('message', receivedWindowMessage);

    return () => {
      window.removeEventListener('message', receivedWindowMessage);
    };
  }, []);

  return (
    <div style={{
      height: `${iFrameHeight}px`,
      boxSizing: 'content-box',
      position: 'relative',
      overflow: 'hidden',
      minHeight: '200px',
    }}
    >
      <iframe
        ref={iframeRef}
        title="preview" // FIXME: i18n needed
        src={`${lmsBaseUrl}/xblocks/v2/${usageKey}/embed/student_view/`}
        data-testid="block-preview"
        style={{
          width: '100%',
          height: '100%',
          minHeight: '200px',
          border: '0 none',
        }}
        // allowing 'autoplay' is required to allow the video XBlock to control the YouTube iframe it has.
        allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"

      />
    </div>
  );
};

export default LibraryBlock;
