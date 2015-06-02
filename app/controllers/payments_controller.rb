class PaymentsController < ApplicationController

  def index
    @payments = Payment.by_client_name.all
    render :json => @payments
  end

  def cashflow
    @payments = Payment.summary.rows.map{|a| a['value']}
    @expenses = Activity.expenses.rows.map{|a| a['value']}
    @cashflow = @payments + @expenses
    render :json => @cashflow
  end

  def show
    @payment = Payment.find(params[:id])
    unless @payment
      render :json => { error: "payment not found: #{params[:id]}" }, :status => 404 and return
    end
    render :json => @payment
  end

  def create
    invoice = Invoice.find(params[:invoice_id])
    unless invoice
      render :json => { error: "invoice not found: #{params[:invoice_id]}" }, :status => 404 and return
    end
    if invoice.status == "Paid"
      render :json => { error: "invoice has already been paid" }, :status => 404 and return
    end

    @payment = Payment.new(params[:payment])
    unless @payment.amount
      render :json => { error: "no amount in payment" }, :status => 400 and return
    end
    @payment.save!

    # update invoice status
    invoice.update_attributes({ status: "Paid", paid_date: @payment.date, paid: @payment.amount })
    invoice.activities.each do |activity|
      if a = Activity.find(activity["_id"])
        a.update_attributes({status: "Paid"})
      end
    end

    render :json => @payment
  end

  def update
    @payment = Payment.find(params[:id])
    unless @payment
      render :json => { error: "payment not found: #{params[:id]}" }, :status => 404 and return
    end
    @payment.attributes = params[:payment]
    if @payment.save
      render :json => @payment
    else
      respond_with(@payment.errors, status: :unprocessable_entity)
    end
  end

end
