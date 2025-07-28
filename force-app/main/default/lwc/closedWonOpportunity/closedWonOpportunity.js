import { LightningElement, api, wire } from 'lwc';
import { getRelatedListRecords } from 'lightning/uiRelatedListApi';
import { NavigationMixin } from 'lightning/navigation';
import { deleteRecord } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class ClosedWonOpportunity extends NavigationMixin(LightningElement) {
    @api recordId;
    error;
    records;

    @wire(getRelatedListRecords, {
        parentRecordId: '$recordId',
        relatedListId: 'Opportunities',
        fields: ['Opportunity.Name', 'Opportunity.StageName', 'Opportunity.CloseDate', 'Opportunity.Amount'],

    }) relatedRecords({ error, data }) {
        if (data) {
            this.records = data.records.filter(record => record.fields.StageName.value === 'Closed Won');
            console.log('data: ' + JSON.stringify(data));
            this.error = undefined;
        } else if (error) {
            this.error = error;
            this.records = undefined;
        }
    }

    handleClickToNew() {
        this[NavigationMixin.Navigate]({
            type: 'standard__objectPage',
            attributes: {
                objectApiName: 'Opportunity',
                actionName: 'new'
            },
            state: {
                defaultFieldValues: `AccountId=${this.recordId}`
            }
        });
    }

    handleButtonClick(event) {
        const selectedAction = event.detail.value;
        const recordId = event.target.dataset.id;

        if (selectedAction === 'edit') {
            this[NavigationMixin.Navigate]({
                type: 'standard__recordPage',
                attributes: {
                    recordId: recordId,
                    objectApiName: 'Opportunity',
                    actionName: 'edit'
                }
            });
        } else if (selectedAction === 'delete') {
            const result = window.confirm('Are you sure you want to delete this opportunity?');
            if(result){
            deleteRecord(recordId)
                .then(() => {
                    this.showToast('Deleted', 'Record deleted successfully', 'success');
                });
            }
        }
    }

    showToast(title, message, variant) {
        this.dispatchEvent(new ShowToastEvent({
            title, message, variant
        })
        );
    }
    handleViewAll() {
        this[NavigationMixin.Navigate]({
            type: 'standard__navItemPage',
            attributes: {
                apiName: 'All_Closed_won_Opportunities'
            },
            state: {
                c__recordId: this.recordId
            }
        });
    }
    navigateToRecord(event) {
        const recordId = event.currentTarget.dataset.id;
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: recordId,
                objectApiName: 'Opportunity',
                actionName: 'view' 
            }
        });
    }
}
