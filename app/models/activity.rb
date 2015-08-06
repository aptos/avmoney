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
    view :by_client_id_and_project
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


  def self.project_summary client_id, project
    activities = Activity.by_client_id_and_project.startkey([client_id, project]).endkey([client_id, project]).all
    if activities.empty?
      return { hours: 0, hours_amount: 0, expenses: 0, tax: 0, total: 0 }
    end

    hours_sum = activities.map{|i| i['hours'] || 0 }.reduce(:+)
    hours_amount = activities.map{|i| i['hours'] && (i['hours'] * i['rate']) || 0 }.reduce(:+)
    expenses = activities.map{|i| i['expense'] || 0 }.reduce(:+)

    tax_paid = activities.map{|i| i['expense'] && i['tax_paid'] && i['tax_paid'] > 0  && i['tax_paid'] || 0 }.reduce(:+)
    tax = tax_paid + activities.map{|i| i['expense'] && i['tax_rate']  && (i['expense'] * i['tax_rate'] * 0.01) || 0 }.reduce(:+)

    total = hours_amount + expenses + tax

    return { hours: hours_sum, hours_amount: hours_amount, expenses: expenses.round(2), tax: tax.round(2), total: total.round(2) }
  end

end