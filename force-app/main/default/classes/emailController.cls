public with sharing class emailController {
    @AuraEnabled
    public static List<sObject> searchRecipients(String searchKey) {
        List<sObject> results = new List<sObject>();
        List<Contact> contacts = [
            SELECT Id, Name FROM Contact
            WHERE Name LIKE :('%' + searchKey + '%') LIMIT 5
        ];
        results.addAll(contacts);
        List<Lead> leads = [
            SELECT Id, Name FROM Lead
            WHERE Name LIKE :('%' + searchKey + '%') LIMIT 5
        ];
        results.addAll(leads);
        return results;
    }
    @AuraEnabled
    public static String sendEmail(List<Id> recipientIds, String subject, String body) {

        List<String> emailAddresses = new List<String>();
        for (Id id : recipientIds) {
            if (id.getSObjectType() == Contact.SObjectType) {
                Contact c = [SELECT Email FROM Contact WHERE Id = :id LIMIT 1];
                if (!String.isBlank(c.Email)) {
                    emailAddresses.add(c.Email);
                }
            } else if (id.getSObjectType() == Lead.SObjectType) {
                Lead l = [SELECT Email FROM Lead WHERE Id = :id LIMIT 1];
                if (!String.isBlank(l.Email)) {
                    emailAddresses.add(l.Email);
                }
            }
       }
        if (!emailAddresses.isEmpty()) {
            Messaging.SingleEmailMessage mail = new Messaging.SingleEmailMessage();
            mail.setToAddresses(emailAddresses);
            mail.setSubject(subject);
            mail.setHtmlBody(body);
            Messaging.sendEmail(new Messaging.SingleEmailMessage[] { mail });
            return 'Email sent successfully.';
        } else {
            return 'No valid recipients found.';
        }
    }
}