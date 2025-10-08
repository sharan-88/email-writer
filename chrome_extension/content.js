
// Extensions, or add-ons, can modify and enhance the capability of a browser. 
// we need two mutations 
// mutations are list of changes that occured in the browser  
// mutations are  browser api watch for changes made to the DOM tree 
// we are doing this to capture the compose event that occurs when user starts creating / writing new email 
// so that we can add new ai assistant button right below there 

function createAIButton() {
   const button = document.createElement('div');
     // button class gmail uses so css is applied as same as send button in 
   button.className = 'T-I J-J5-Ji aoO v7 T-I-atl L3';
   button.style.marginRight = '8px';
   button.innerHTML = 'AI Reply';
   button.setAttribute('role','button');
   button.setAttribute('data-tooltip','Generate AI Reply');
   return button;
}

function getEmailContent() {
    const selectors = [
        '.h7',
        '.a3s.aiL',
        '.gmail_quote',
        '[role="presentation"]'
    ];
    for (const selector of selectors) {
        const content = document.querySelector(selector);
        if (content) {
            return content.innerText.trim();
        }
        return '';
    }
}


function findComposeToolbar() {
    const selectors = [
        '.btC',
        '.aDh',
        '[role="toolbar"]',
        '.gU.Up'
    ];
    for (const selector of selectors) {
        const toolbar = document.querySelector(selector);
        if (toolbar) {
            return toolbar;
        }
        return null;
    }
}

function injectButton() {
    const existingButton = document.querySelector('.ai-reply-button');
    // check if already button exis if exist remove that
    if (existingButton) existingButton.remove();
    //    find tool bar in compose if not found just return 
    const toolbar = findComposeToolbar();
    if (!toolbar) {
        console.log(" error Toolbar not found");
        return;
    }

    console.log("Toolbar found,now  creating AI button");
    const button = createAIButton();
    button.classList.add('ai-reply-button');
     // adding event listener to get response from backend 
    button.addEventListener('click', async () => {
        try {
            button.innerHTML = 'Generating...';
            button.disabled = true;
            // get email content from the compose
            const emailContent = getEmailContent();
            const response = await fetch('http://localhost:8080/api/email/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    emailContent: emailContent,
                    tone: "professional"
                })
            });

            if (!response.ok) {
                throw new Error('API Request Failed');
            }

            const generatedReply = await response.text();
            const composeBox = document.querySelector('[role="textbox"][g_editable="true"]');

            if (composeBox) {
                composeBox.focus();
                document.execCommand('insertText', false, generatedReply);
            } else {
                console.error('Compose box was not found');
            }
        } catch (error) {
            console.error(error);
            alert('Failed to generate reply');
        } finally {
            button.innerHTML = 'AI Reply';
            button.disabled =  false;
        }
    });
    // insert into toolbar
    toolbar.insertBefore(button, toolbar.firstChild);
}

const observer = new MutationObserver((mutations) => {
    for(const mutation of mutations) {
        const addedNodes = Array.from(mutation.addedNodes);
        // mutations.addedNodes is a list of nodes that were added to the DOM
        // in js .some check if any of nodes matches the condition 
        const hasComposeElements = addedNodes.some(node =>
            node.nodeType === Node.ELEMENT_NODE && 
            (node.matches('.aDh, .btC, [role="dialog"]') || node.querySelector('.aDh, .btC, [role="dialog"]'))
        );

        if (hasComposeElements) {
            // is we get compose window we inject the button 
            // timeout is just make sure that compose window is fully loaded 
            console.log("Compose Window Detected injecting button ");
            setTimeout(injectButton, 500);
        }
    }
});

// this is instance starts observing a entire dom
observer.observe(document.body, {
        // if any changes to nodes that are child or descendent to nodes in the condition

    childList: true,
    subtree: true
});