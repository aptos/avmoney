class InvoicesController < ApplicationController

  def index
    if params[:status]
      @invoices = Invoice.by_status.key(params[:status]).all
    else
      @invoices =  Invoice.by_name.all
    end
    render :json => @invoices
  end

  def show
    @invoice = Invoice.find(params[:id])
    unless @invoice
      render :json => { error: "invoice not found: #{params[:id]}" }, :status => 404 and return
    end

    if @invoice.status != 'Paid'
      @invoice.activities.each_index do |idx|
        if a = Activity.find(@invoice.activities[idx]["_id"])
          @invoice.activities[idx] = a
        end
      end
      @invoice.hours_sum = @invoice.activities.map{|i| i['hours'] || 0 }.reduce(:+)
      @invoice.hours_amount = @invoice.activities.map{|i| i['hours'] && (i['hours'] * i['rate']) || 0 }.reduce(:+)
      @invoice.expenses = @invoice.activities.map{|i| i['expense'] || 0 }.reduce(:+)

      tax_paid = @invoice.activities.map{|i| i['expense'] && i['tax_paid'] && i['tax_paid'] > 0  && i['tax_paid'] || 0 }.reduce(:+)
      @invoice.tax = tax_paid + @invoice.activities.map{|i| i['expense'] && i['tax_rate']  && (i['expense'] * i['tax_rate'] * 0.01) || 0 }.reduce(:+)

      @invoice.invoice_total = @invoice.hours_amount + @invoice.expenses + @invoice.tax

      @invoice.save
    end

    render :json => @invoice
  end

  def create
    @invoice = Invoice.new(params[:invoice])
    begin
      @invoice.save
    rescue Exception => e
      status = 400
      if e.message.include? "Conflict"
        status = 409
      end
      render :json => { error: e.message, invoice: @invoice }, :status => status and return
    end

    # update each activity status
    params[:activities].each do |activity|
      if a = Activity.find(activity["_id"])
        a.update_attributes({status: "Invoiced", invoice_id: @invoice._id})
      end
    end

    render :json => @invoice
  end

  def update
    @invoice = Invoice.find(params[:id])
    unless @invoice
      render :json => { error: "invoice not found: #{params[:id]}" }, :status => 404 and return
    end
    @invoice.attributes = params[:invoice]
    if @invoice.save
      render :json => @invoice
    else
      respond_with(@invoice.errors, status: :unprocessable_entity)
    end

    # update each activity status
    params[:activities].each do |activity|
      if activity["status"] != "Invoiced"
        if a = Activity.find(activity["_id"])
          a.update_attributes({status: "Invoiced", invoice_id: @invoice._id})
        end
      end
    end

  end

  def destroy
    @invoice = Invoice.find(params[:id])
    unless @invoice
      render :json => { error: "invoice not found: #{params[:id]}" }, :status => 404 and return
    end

    # update each activity status back to open
    @invoice.activities.each do |activity|
      if a = Activity.find(activity["_id"])
        logger.info "Found Activity: #{activity["_id"]}"
        a.update_attributes({status: "Active", invoice_id: nil})
      end
    end

    @invoice.destroy
    render :json => { status: "deleted" }
  end

  private

  def hash_diff(one, other)
    memo = {}
    one.keys.each do |key|
      next if ['date', 'updated_at', 'created_at'].include? key
      unless one[key] == other[key]
        memo[key] = [one[key] => other[key]]
      end
    end
    logger.info memo.inspect if memo.size > 0
    memo.size > 0
  end

end
