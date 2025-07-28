import { LightningElement, wire, api } from 'lwc';
import { getRelatedListRecords } from 'lightning/uiRelatedListApi';
import { CurrentPageReference } from 'lightning/navigation';
import { NavigationMixin } from 'lightning/navigation';
import { deleteRecord } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class allClosedWonOpportunities extends NavigationMixin(LightningElement) {
    @api recordId;
    error;
    _records;

    @wire(CurrentPageReference)
    getStateParameters(currentPageReference) {
        if (currentPageReference &&
            currentPageReference.state &&
            currentPageReference.state.c__recordId
        ) {
            this.recordId = currentPageReference.state.c__recordId;
        }
    }

    @wire(getRelatedListRecords, {
        parentRecordId: '$recordId',
        relatedListId: 'Opportunities',
        fields: ['Opportunity.Name', 'Opportunity.StageName', 'Opportunity.CloseDate', 'Opportunity.Amount'],
    })
    wiredOpportunities({ data, error }) {
        if (data) {
            console.log('Fetched related records:', data);
            this.records = data.records.filter(rec => rec.fields.StageName.value === 'Closed Won');
            this.error = undefined;
        } else if (error) {
            console.error('Error fetching opportunities:', error);
            this.error = error;
            this.records = undefined;
        }
    }

    set records(value) {
        this._records = value;
    }

    get records() {
        if (!this._records) return [];
        return this._records.map(rec => ({
            Id: rec.id,
            Name: rec.fields.Name.value,
            StageName: rec.fields.StageName.value,
            CloseDate: rec.fields.CloseDate.value,
            Amount: rec.fields.Amount.value
        }));
    }

    columns = [
        { label: 'Name', fieldName: 'Name', type:'button', typeAttributes:{
            label: {fieldName: 'Name'},
            name: 'view',
             variant: 'base'
        }},
        { label: 'Stage', fieldName: 'StageName' },
        { label: 'Close Date', fieldName: 'CloseDate' },
        { label: 'Amount', fieldName: 'Amount', type: 'currency' },
        {
            type: 'action', typeAttributes: {
                rowActions: [
                    { label: 'Edit', name: 'edit' },
                    { label: 'Delete', name: 'delete' }
                ]
            }
        }
    ];

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
    handleRowAction(event) {
        const actionName = event.detail.action.name;
        const row = event.detail.row;
        if (actionName === 'edit') {
            this[NavigationMixin.Navigate]({
                type: 'standard__recordPage',
                attributes: {
                    recordId: row.Id,
                    objectApiName: 'Opportunity',
                    actionName: 'edit'
                }
            });
        }
        else if (actionName === 'delete') {
            const result = window.confirm('Are you sure you want to delete this opportunity?');
            if(result) {
            deleteRecord(row.Id).then(() => {
                this.showToast('Deleted', 'Record deleted successfully', 'success');
            });}
        }
        else if (actionName === 'view') {
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: row.Id,
                objectApiName: 'Opportunity',
                actionName: 'view'
            }
        });
    } 

    }
    showToast(title, message, variant) {
        this.dispatchEvent(new ShowToastEvent({
            title, message, variant
        })
        );
    }
    
    
}
