class Invoice < CouchRest::Model::Base
  validates_uniqueness_of :invoice_number, scope: :client_id, :message => "This Client already has an Invoice with that number"

  property :_id, String
  property :invoice_number, Integer
  property :po_number, String
  property :work_order, String
  property :client_id, String
  property :name, String
  property :client_data, Hash
  property :hours_sum, Float
  property :hours_amount, Float
  property :expenses, Float
  property :tax, Float
  property :invoice_total, Float
  property :activities, Array
  property :project, String
  property :status, String, default: 'Open'
  property :open_date, Date
  property :paid_date, Date
  property :paid, Float

  timestamps!

  design do
    view :by_client_id_and_status
  end

  design do
    view :by_client,
    :map =>
    "function(doc) {
    if (doc['type'] == 'Invoice') {
      var paid = (!!doc.paid) ? doc.paid : 0.0;
      var work_order = (!!doc.work_order) ? doc.work_order : '';
      var po_number = (!!doc.po_number) ? doc.po_number : '';
      emit(doc.client_id, { created_at: doc.created_at, name: doc.name, client_id: doc.client_id, project: doc.project, po_number: po_number, work_order: work_order, invoice_number: doc.invoice_number, invoice_total: doc.invoice_total, paid: paid,  status: doc.status});
    }
    }"
  end

  design do
    view :by_status,
    :map =>
    "function(doc) {
    if (doc['type'] == 'Invoice') {
      var paid = (!!doc.paid) ? doc.paid : 0.0;
      var work_order = (!!doc.work_order) ? doc.work_order : '';
      var po_number = (!!doc.po_number) ? doc.po_number : '';
      emit(doc.status, { open_date: doc.open_date, name: doc.name, client_id: doc.client_id, project: doc.project, po_number: po_number, work_order: work_order, invoice_number: doc.invoice_number, invoice_total: doc.invoice_total, paid: paid,  status: doc.status});
    }
    }"
  end

  design do
    view :by_name,
    :map =>
    "function(doc) {
    if ((doc['type'] == 'Invoice') && (doc['name'] != null)) {
      emit(doc['name'], doc.invoice_number);
    }
    };"
  end

  def self.stats client=nil
    startkey = [client]
    client = client || {}
    endkey = [client, {}]
    Rails.logger.info "Keys: #{startkey}, #{endkey}"
    rows = self.by_client_id_and_status.startkey(startkey).endkey(endkey).reduce.group_level(2).rows
    @stats = Hash.new
    rows.each {|r| @stats[r["key"][0]] = {}}
    rows.each {|r| @stats[r["key"][0]][r["key"][1]] = r["value"]}
    return @stats
  end

  # return map of invoice id to invoice_number
  def self.map
    invoices_map = {}
    self.by_client['rows'].each do |r|
      invoices_map[r['id']] = r['value']['invoice_number']
    end
    invoices_map
  end

  def update_totals
    self.hours_sum = self.activities.map{|i| i['hours'] || 0 }.reduce(:+)
    self.hours_amount = self.activities.map{|i| i['hours'] && (i['hours'] * i['rate']) || 0 }.reduce(:+)
    self.expenses = self.activities.map{|i| i['expense'] || 0 }.reduce(:+)

    tax_paid = self.activities.map{|i| i['expense'] && i['tax_paid'] && i['tax_paid'] > 0  && i['tax_paid'] || 0 }.reduce(:+)
    self.tax = tax_paid + self.activities.map{|i| i['expense'] && i['tax_rate']  && (i['expense'] * i['tax_rate'] * 0.01) || 0 }.reduce(:+)

    self.invoice_total = self.hours_amount + self.expenses + self.tax
    self
  end

end