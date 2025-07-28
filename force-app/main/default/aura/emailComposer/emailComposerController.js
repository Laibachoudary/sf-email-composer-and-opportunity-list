({
    handleKeyChange: function (component, event, helper) {
        let searchKey = component.get("v.searchKey");
        if (searchKey.length > 1) {
            let action = component.get("c.searchRecipients");
            action.setParams({ searchKey: searchKey });
            action.setCallback(this, function (response) {
                if (response.getState() === "SUCCESS") {
                    component.set("v.searchResults", response.getReturnValue());
                }
            });
            $A.enqueueAction(action);
        } else {
            component.set("v.searchResults", []);
        }
    },

    selectRecipient: function (component, event, helper) {
        let id = event.currentTarget.getAttribute("data-id");
        let name = event.currentTarget.getAttribute("data-name");
        let ids = component.get("v.recipientIds");
        let names = component.get("v.recipientNames");
        if (!ids.includes(id)) {
            ids.push(id);
            names.push(name);
        }
        component.set("v.recipientIds", ids);
        component.set("v.recipientNames", names);
        component.set("v.searchKey", "");
        component.set("v.searchResults", []);
    },

    removeRecipient: function (component, event, helper) {
        let index = parseInt(event.getSource().get("v.name"));
        let ids = component.get("v.recipientIds");
        let names = component.get("v.recipientNames");
        ids.splice(index, 1);
        names.splice(index, 1);
        component.set("v.recipientIds", ids);
        component.set("v.recipientNames", names);
    },

    SendEmail: function (component, event, helper) {
        let recipientIds = component.get("v.recipientIds");
        let subject = component.get("v.subject");
        let body = component.get("v.body");
        if (!recipientIds && !subject) {
            alert("Please select at least one recipient and enter a subject.");
            return;
        }
        if (!recipientIds ) {
            alert("Please select at least one recipient.");
            return;
        }
        if (!subject) {
            alert("Please enter a subject.");
            return;
        }
        let action = component.get("c.sendEmail");
        action.setParams({
            recipientIds: recipientIds,
            subject: subject,
            body: body
        });
        action.setCallback(this, function (response) {
            if (response.getState() === "SUCCESS") {
                alert("Email sent successfully!");
                component.set("v.recipientIds", []);
                component.set("v.recipientNames", []);
                component.set("v.subject", "");
                component.set("v.body", "");
                component.set("v.searchKey", "");
            } else {
                alert("Error sending email.");
                console.error(response.getError());
            }
        });
        $A.enqueueAction(action);
    }
});
