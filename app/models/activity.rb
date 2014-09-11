class Activity < CouchRest::Model::Base
  property :_id, String
  property :client_id, String
  property :client_name, String
  property :project, String
  property :notes, String
  property :date, Date
  property :hours, Float
  property :rate, Float
  property :expense, Float
  property :tax_rate, Float
  property :tax_paid, Float
  property :status, String, default: "Active"
  property :invoice_id, String

  timestamps!

  design do
    view :by_date
    view :by_client_id_and_status
    view :by_invoice_id
  end

  design do
    view :by_client_id
  end

  design do
    view :summary,
    :map =>
    "function(doc) { if (doc.type == 'Activity') {
      emit([doc.client_name, doc.date], [doc.date, doc.client_name, doc.project, doc.notes, doc.hours, doc.expense, doc.status, doc.invoice_id]);
    }
    };"
    view :expenses,
    :map =>
    "function(doc) { if (doc.type == 'Activity' && !!doc.expense) {
      emit([doc.date, doc.client_name], {date: doc.date, client_id: doc.client_id, client_name: doc.client_name, project: doc.project, type: 'expense', notes: doc.notes, amount: doc.expense});
    }
    };"
  end

end