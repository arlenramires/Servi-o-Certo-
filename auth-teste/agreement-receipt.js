const cleanName=value=>String(value).replace(/[^a-zA-Z0-9_-]/g,'-').slice(0,80);

export function buildAgreementReceipt(contract,decisions) {
  const accepted=decisions.filter(d=>d.contract_id===contract.id&&d.decision==='aceito');
  const byActor=new Map(accepted.map(d=>[d.actor_id,d]));
  if(!byActor.has(contract.client_id)||!byActor.has(contract.provider_id))throw new Error('O comprovante só pode ser emitido após o aceite das duas partes.');
  return {
    receipt_type:'servico_certo_agreement_acceptance',schema_version:1,
    notice:'Comprovante eletrônico de aceite em homologação. Não é assinatura digital certificada nem comprovante de pagamento.',
    agreement:{id:contract.id,request_id:contract.request_id,quote_id:contract.quote_id,version:contract.version,content_hash:contract.content_hash,created_at:contract.created_at,document:contract.document},
    acceptances:[contract.client_id,contract.provider_id].map(actor_id=>({actor_id,decision:'aceito',created_at:byActor.get(actor_id).created_at}))
  };
}

export function downloadAgreementReceipt(contract,decisions) {
  const receipt=buildAgreementReceipt(contract,decisions);
  const blob=new Blob([JSON.stringify(receipt,null,2)+'\n'],{type:'application/json'}),url=URL.createObjectURL(blob),link=document.createElement('a');
  link.href=url;link.download=`acordo-${cleanName(contract.request_id)}-v${contract.version}.json`;link.click();URL.revokeObjectURL(url);
}
